import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { CreateChapterInput, UpdateChapterInput } from "./schema";

export async function listChapters(subjectId: number) {
  return db
    .selectFrom("chapters")
    .selectAll()
    .where("subjectId", "=", subjectId)
    .orderBy("orderIndex", "asc")
    .execute();
}

export async function createChapter(subjectId: number, input: CreateChapterInput) {
  const subject = await db.selectFrom("subjects").select("id").where("id", "=", subjectId).executeTakeFirst();
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  let orderIndex = input.orderIndex;
  if (orderIndex === undefined) {
    const last = await db
      .selectFrom("chapters")
      .select("orderIndex")
      .where("subjectId", "=", subjectId)
      .orderBy("orderIndex", "desc")
      .executeTakeFirst();
    orderIndex = (last?.orderIndex ?? -1) + 1;
  }

  const result = await db
    .insertInto("chapters")
    .values({ subjectId, title: input.title, orderIndex, updatedAt: new Date() })
    .executeTakeFirstOrThrow();
  return db
    .selectFrom("chapters")
    .selectAll()
    .where("id", "=", Number(result.insertId))
    .executeTakeFirstOrThrow();
}

export async function updateChapter(subjectId: number, id: number, input: UpdateChapterInput) {
  const chapter = await db
    .selectFrom("chapters")
    .selectAll()
    .where("id", "=", id)
    .where("subjectId", "=", subjectId)
    .executeTakeFirst();
  if (!chapter) {
    throw new ApiError(404, "Chapter not found");
  }

  await db
    .updateTable("chapters")
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.orderIndex !== undefined ? { orderIndex: input.orderIndex } : {}),
      updatedAt: new Date(),
    })
    .where("id", "=", id)
    .execute();
  return db.selectFrom("chapters").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}

export async function deleteChapter(subjectId: number, id: number) {
  const chapter = await db
    .selectFrom("chapters")
    .select("id")
    .where("id", "=", id)
    .where("subjectId", "=", subjectId)
    .executeTakeFirst();
  if (!chapter) {
    throw new ApiError(404, "Chapter not found");
  }
  await db.deleteFrom("chapters").where("id", "=", id).execute();
}
