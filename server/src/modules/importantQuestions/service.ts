import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { deleteUploadedFile, publicPathFor } from "../../middleware/upload";
import { CreateImportantQuestionInput } from "./schema";

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
    throw new ApiError(403, "You must be enrolled in this course to view this");
  }
}

export async function listForChapter(chapterId: number) {
  return prisma.importantQuestion.findMany({ where: { chapterId }, orderBy: { orderIndex: "asc" } });
}

export async function create(
  chapterId: number,
  input: CreateImportantQuestionInput,
  filename: string,
  mimeType: string,
  uploadedBy: number
) {
  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (!chapter) throw new ApiError(404, "Chapter not found");

  const last = await prisma.importantQuestion.findFirst({
    where: { chapterId },
    orderBy: { orderIndex: "desc" },
  });
  const orderIndex = (last?.orderIndex ?? -1) + 1;

  return prisma.importantQuestion.create({
    data: {
      chapterId,
      title: input.title,
      filePath: publicPathFor("important-questions", filename),
      mimeType,
      orderIndex,
      uploadedBy,
    },
  });
}

export async function remove(id: number) {
  const item = await prisma.importantQuestion.findUnique({ where: { id } });
  if (!item) throw new ApiError(404, "Not found");
  deleteUploadedFile(item.filePath);
  await prisma.importantQuestion.delete({ where: { id } });
}

export async function reorder(id: number, direction: "up" | "down") {
  const item = await prisma.importantQuestion.findUnique({ where: { id } });
  if (!item) throw new ApiError(404, "Not found");

  const sibling = await prisma.importantQuestion.findFirst({
    where: {
      chapterId: item.chapterId,
      orderIndex: direction === "up" ? { lt: item.orderIndex } : { gt: item.orderIndex },
    },
    orderBy: { orderIndex: direction === "up" ? "desc" : "asc" },
  });
  if (!sibling) return;

  await prisma.$transaction([
    prisma.importantQuestion.update({ where: { id: item.id }, data: { orderIndex: sibling.orderIndex } }),
    prisma.importantQuestion.update({ where: { id: sibling.id }, data: { orderIndex: item.orderIndex } }),
  ]);
}

export async function getBookmarkCounts(itemIds: number[]) {
  if (itemIds.length === 0) return new Map<number, number>();
  const rows = await prisma.bookmark.groupBy({
    by: ["contentId"],
    where: { contentType: "important_question", contentId: { in: itemIds } },
    _count: { contentId: true },
  });
  return new Map(rows.map((r) => [r.contentId, r._count.contentId]));
}
