import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { deleteSecureUploadedFile, secureFilePathFor } from "../../middleware/upload";
import { CreateNoteInput } from "./schema";

export async function assertCanAccessChapter(userId: number, chapterId: number) {
  const chapter = await db
    .selectFrom("chapters")
    .innerJoin("subjects", "subjects.id", "chapters.subjectId")
    .select(["chapters.id as id", "subjects.courseId as courseId"])
    .where("chapters.id", "=", chapterId)
    .executeTakeFirst();
  if (!chapter) throw new ApiError(404, "Chapter not found");
  if (chapter.courseId === null) {
    throw new ApiError(403, "This chapter's subject is not yet assigned to a course");
  }

  const enrollment = await db
    .selectFrom("enrollments")
    .select("status")
    .where("userId", "=", userId)
    .where("courseId", "=", chapter.courseId)
    .executeTakeFirst();
  if (!enrollment || enrollment.status !== "approved") {
    throw new ApiError(403, "You must be enrolled in this course to view its notes");
  }
}

export async function listNotesForChapter(chapterId: number) {
  return db.selectFrom("notes").selectAll().where("chapterId", "=", chapterId).orderBy("orderIndex", "asc").execute();
}

export async function createNote(chapterId: number, input: CreateNoteInput, filename: string, uploadedBy: number) {
  const chapter = await db.selectFrom("chapters").select("id").where("id", "=", chapterId).executeTakeFirst();
  if (!chapter) throw new ApiError(404, "Chapter not found");

  const last = await db
    .selectFrom("notes")
    .select("orderIndex")
    .where("chapterId", "=", chapterId)
    .orderBy("orderIndex", "desc")
    .executeTakeFirst();
  const orderIndex = (last?.orderIndex ?? -1) + 1;

  const result = await db
    .insertInto("notes")
    .values({ chapterId, title: input.title, filePath: filename, orderIndex, uploadedBy, updatedAt: new Date() })
    .executeTakeFirstOrThrow();
  return db.selectFrom("notes").selectAll().where("id", "=", Number(result.insertId)).executeTakeFirstOrThrow();
}

export async function replaceNote(id: number, filename: string) {
  const note = await db.selectFrom("notes").selectAll().where("id", "=", id).executeTakeFirst();
  if (!note) throw new ApiError(404, "Note not found");

  deleteSecureUploadedFile("notes", note.filePath);
  await db.updateTable("notes").set({ filePath: filename, updatedAt: new Date() }).where("id", "=", id).execute();
  return db.selectFrom("notes").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}

export async function deleteNote(id: number) {
  const note = await db.selectFrom("notes").selectAll().where("id", "=", id).executeTakeFirst();
  if (!note) throw new ApiError(404, "Note not found");

  deleteSecureUploadedFile("notes", note.filePath);
  await db.deleteFrom("notes").where("id", "=", id).execute();
}

export async function getNoteFileForRequest(userId: number | undefined, isAdmin: boolean, noteId: number) {
  const note = await db
    .selectFrom("notes")
    .innerJoin("chapters", "chapters.id", "notes.chapterId")
    .innerJoin("subjects", "subjects.id", "chapters.subjectId")
    .select(["notes.id as id", "notes.filePath as filePath", "notes.title as title", "subjects.courseId as courseId"])
    .where("notes.id", "=", noteId)
    .executeTakeFirst();
  if (!note) throw new ApiError(404, "Note not found");

  if (!isAdmin) {
    if (!userId) throw new ApiError(401, "Not authenticated");
    if (note.courseId === null) {
      throw new ApiError(403, "This note's subject is not yet assigned to a course");
    }
    const enrollment = await db
      .selectFrom("enrollments")
      .select("status")
      .where("userId", "=", userId)
      .where("courseId", "=", note.courseId)
      .executeTakeFirst();
    if (!enrollment || enrollment.status !== "approved") {
      throw new ApiError(403, "You must be enrolled in this course to view its notes");
    }
  }

  return { absolutePath: secureFilePathFor("notes", note.filePath), title: note.title };
}

export async function reorderNote(id: number, direction: "up" | "down") {
  const note = await db.selectFrom("notes").selectAll().where("id", "=", id).executeTakeFirst();
  if (!note) throw new ApiError(404, "Note not found");

  const sibling = await db
    .selectFrom("notes")
    .selectAll()
    .where("chapterId", "=", note.chapterId)
    .where("orderIndex", direction === "up" ? "<" : ">", note.orderIndex)
    .orderBy("orderIndex", direction === "up" ? "desc" : "asc")
    .executeTakeFirst();
  if (!sibling) return;

  await db.transaction().execute(async (trx) => {
    await trx
      .updateTable("notes")
      .set({ orderIndex: sibling.orderIndex, updatedAt: new Date() })
      .where("id", "=", note.id)
      .execute();
    await trx
      .updateTable("notes")
      .set({ orderIndex: note.orderIndex, updatedAt: new Date() })
      .where("id", "=", sibling.id)
      .execute();
  });
}

export async function getBookmarkCounts(noteIds: number[]) {
  if (noteIds.length === 0) return new Map<number, number>();
  const rows = await db
    .selectFrom("bookmarks")
    .select(["contentId", (eb) => eb.fn.countAll().as("count")])
    .where("contentType", "=", "note")
    .where("contentId", "in", noteIds)
    .groupBy("contentId")
    .execute();
  return new Map(rows.map((r) => [r.contentId, Number(r.count)]));
}
