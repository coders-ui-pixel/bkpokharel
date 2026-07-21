import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { deleteSecureUploadedFile, secureFilePathFor } from "../../middleware/upload";
import { CreateNoteInput } from "./schema";

export async function assertCanAccessChapter(userId: number, chapterId: number) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { subject: true },
  });
  if (!chapter) throw new ApiError(404, "Chapter not found");
  if (chapter.subject.courseId === null) {
    throw new ApiError(403, "This chapter's subject is not yet assigned to a course");
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: chapter.subject.courseId } },
  });
  if (!enrollment || enrollment.status !== "approved") {
    throw new ApiError(403, "You must be enrolled in this course to view its notes");
  }
}

export async function listNotesForChapter(chapterId: number) {
  return prisma.note.findMany({ where: { chapterId }, orderBy: { orderIndex: "asc" } });
}

export async function createNote(chapterId: number, input: CreateNoteInput, filename: string, uploadedBy: number) {
  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (!chapter) throw new ApiError(404, "Chapter not found");

  const last = await prisma.note.findFirst({ where: { chapterId }, orderBy: { orderIndex: "desc" } });
  const orderIndex = (last?.orderIndex ?? -1) + 1;

  return prisma.note.create({
    data: {
      chapterId,
      title: input.title,
      filePath: filename,
      orderIndex,
      uploadedBy,
    },
  });
}

export async function replaceNote(id: number, filename: string) {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note) throw new ApiError(404, "Note not found");

  deleteSecureUploadedFile("notes", note.filePath);
  return prisma.note.update({ where: { id }, data: { filePath: filename } });
}

export async function deleteNote(id: number) {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note) throw new ApiError(404, "Note not found");

  deleteSecureUploadedFile("notes", note.filePath);
  await prisma.note.delete({ where: { id } });
}

export async function getNoteFileForRequest(userId: number | undefined, isAdmin: boolean, noteId: number) {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: { chapter: { include: { subject: true } } },
  });
  if (!note) throw new ApiError(404, "Note not found");

  if (!isAdmin) {
    if (!userId) throw new ApiError(401, "Not authenticated");
    if (note.chapter.subject.courseId === null) {
      throw new ApiError(403, "This note's subject is not yet assigned to a course");
    }
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: note.chapter.subject.courseId } },
    });
    if (!enrollment || enrollment.status !== "approved") {
      throw new ApiError(403, "You must be enrolled in this course to view its notes");
    }
  }

  return { absolutePath: secureFilePathFor("notes", note.filePath), title: note.title };
}

export async function reorderNote(id: number, direction: "up" | "down") {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note) throw new ApiError(404, "Note not found");

  const sibling = await prisma.note.findFirst({
    where: {
      chapterId: note.chapterId,
      orderIndex: direction === "up" ? { lt: note.orderIndex } : { gt: note.orderIndex },
    },
    orderBy: { orderIndex: direction === "up" ? "desc" : "asc" },
  });
  if (!sibling) return;

  await prisma.$transaction([
    prisma.note.update({ where: { id: note.id }, data: { orderIndex: sibling.orderIndex } }),
    prisma.note.update({ where: { id: sibling.id }, data: { orderIndex: note.orderIndex } }),
  ]);
}

export async function getBookmarkCounts(noteIds: number[]) {
  if (noteIds.length === 0) return new Map<number, number>();
  const rows = await prisma.bookmark.groupBy({
    by: ["contentId"],
    where: { contentType: "note", contentId: { in: noteIds } },
    _count: { contentId: true },
  });
  return new Map(rows.map((r) => [r.contentId, r._count.contentId]));
}
