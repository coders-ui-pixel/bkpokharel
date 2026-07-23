import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { deleteUploadedFile, publicPathFor } from "../../middleware/upload";
import { CreateImportantQuestionInput } from "./schema";

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
    throw new ApiError(403, "You must be enrolled in this course to view this");
  }
}

export async function listForChapter(chapterId: number) {
  return db
    .selectFrom("importantQuestions")
    .selectAll()
    .where("chapterId", "=", chapterId)
    .orderBy("orderIndex", "asc")
    .execute();
}

export async function create(
  chapterId: number,
  input: CreateImportantQuestionInput,
  filename: string,
  mimeType: string,
  uploadedBy: number
) {
  const chapter = await db.selectFrom("chapters").select("id").where("id", "=", chapterId).executeTakeFirst();
  if (!chapter) throw new ApiError(404, "Chapter not found");

  const last = await db
    .selectFrom("importantQuestions")
    .select("orderIndex")
    .where("chapterId", "=", chapterId)
    .orderBy("orderIndex", "desc")
    .executeTakeFirst();
  const orderIndex = (last?.orderIndex ?? -1) + 1;

  const result = await db
    .insertInto("importantQuestions")
    .values({
      chapterId,
      title: input.title,
      filePath: publicPathFor("important-questions", filename),
      mimeType,
      orderIndex,
      uploadedBy,
      updatedAt: new Date(),
    })
    .executeTakeFirstOrThrow();
  return db
    .selectFrom("importantQuestions")
    .selectAll()
    .where("id", "=", Number(result.insertId))
    .executeTakeFirstOrThrow();
}

export async function remove(id: number) {
  const item = await db.selectFrom("importantQuestions").selectAll().where("id", "=", id).executeTakeFirst();
  if (!item) throw new ApiError(404, "Not found");
  deleteUploadedFile(item.filePath);
  await db.deleteFrom("importantQuestions").where("id", "=", id).execute();
}

export async function reorder(id: number, direction: "up" | "down") {
  const item = await db.selectFrom("importantQuestions").selectAll().where("id", "=", id).executeTakeFirst();
  if (!item) throw new ApiError(404, "Not found");

  const sibling = await db
    .selectFrom("importantQuestions")
    .selectAll()
    .where("chapterId", "=", item.chapterId)
    .where("orderIndex", direction === "up" ? "<" : ">", item.orderIndex)
    .orderBy("orderIndex", direction === "up" ? "desc" : "asc")
    .executeTakeFirst();
  if (!sibling) return;

  await db.transaction().execute(async (trx) => {
    await trx
      .updateTable("importantQuestions")
      .set({ orderIndex: sibling.orderIndex, updatedAt: new Date() })
      .where("id", "=", item.id)
      .execute();
    await trx
      .updateTable("importantQuestions")
      .set({ orderIndex: item.orderIndex, updatedAt: new Date() })
      .where("id", "=", sibling.id)
      .execute();
  });
}

export async function getBookmarkCounts(itemIds: number[]) {
  if (itemIds.length === 0) return new Map<number, number>();
  const rows = await db
    .selectFrom("bookmarks")
    .select(["contentId", (eb) => eb.fn.countAll().as("count")])
    .where("contentType", "=", "important_question")
    .where("contentId", "in", itemIds)
    .groupBy("contentId")
    .execute();
  return new Map(rows.map((r) => [r.contentId, Number(r.count)]));
}
