import { sql } from "kysely";
import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { CreateFlashCardInput, UpdateProgressInput } from "./schema";

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

export async function listForChapter(chapterId: number, userId: number) {
  const cards = await db
    .selectFrom("flashCards")
    .selectAll()
    .where("chapterId", "=", chapterId)
    .orderBy("orderIndex", "asc")
    .execute();
  if (cards.length === 0) return [];

  const progressRows = await db
    .selectFrom("flashCardProgress")
    .selectAll()
    .where("userId", "=", userId)
    .where(
      "flashCardId",
      "in",
      cards.map((c) => c.id)
    )
    .execute();
  const progressByCard = new Map(progressRows.map((p) => [p.flashCardId, p]));

  return cards.map((card) => {
    const progress = progressByCard.get(card.id);
    return {
      id: card.id,
      chapterId: card.chapterId,
      front: card.front,
      back: card.back,
      status: progress?.status ?? "new",
      isFavorite: progress?.isFavorite ?? false,
      reviewCount: progress?.reviewCount ?? 0,
    };
  });
}

export async function assertCanAccessCourse(userId: number, courseId: number) {
  const enrollment = await db
    .selectFrom("enrollments")
    .select("status")
    .where("userId", "=", userId)
    .where("courseId", "=", courseId)
    .executeTakeFirst();
  if (!enrollment || enrollment.status !== "approved") {
    throw new ApiError(403, "You must be enrolled in this course to view this");
  }
}

export async function listForCourse(courseId: number, userId: number) {
  const cards = await db
    .selectFrom("flashCards")
    .innerJoin("chapters", "chapters.id", "flashCards.chapterId")
    .innerJoin("subjects", "subjects.id", "chapters.subjectId")
    .select([
      "flashCards.id as id",
      "flashCards.chapterId as chapterId",
      "flashCards.front as front",
      "flashCards.back as back",
      "flashCards.orderIndex as orderIndex",
      "chapters.title as chapterTitle",
      "chapters.orderIndex as chapterOrderIndex",
      "subjects.id as subjectId",
      "subjects.title as subjectTitle",
      "subjects.orderIndex as subjectOrderIndex",
    ])
    .where("subjects.courseId", "=", courseId)
    .execute();

  cards.sort((a, b) => {
    if (a.subjectOrderIndex !== b.subjectOrderIndex) return a.subjectOrderIndex - b.subjectOrderIndex;
    if (a.chapterOrderIndex !== b.chapterOrderIndex) return a.chapterOrderIndex - b.chapterOrderIndex;
    return a.orderIndex - b.orderIndex;
  });

  const cardIds = cards.map((c) => c.id);
  const progressRows = cardIds.length
    ? await db
        .selectFrom("flashCardProgress")
        .selectAll()
        .where("userId", "=", userId)
        .where("flashCardId", "in", cardIds)
        .execute()
    : [];
  const progressByCard = new Map(progressRows.map((p) => [p.flashCardId, p]));

  return cards.map((card) => {
    const progress = progressByCard.get(card.id);
    return {
      id: card.id,
      chapterId: card.chapterId,
      chapterTitle: card.chapterTitle,
      subjectId: card.subjectId,
      subjectTitle: card.subjectTitle,
      front: card.front,
      back: card.back,
      status: progress?.status ?? "new",
      isFavorite: progress?.isFavorite ?? false,
      reviewCount: progress?.reviewCount ?? 0,
    };
  });
}

export async function listForChapterAdmin(chapterId: number) {
  const cards = await db
    .selectFrom("flashCards")
    .selectAll()
    .where("chapterId", "=", chapterId)
    .orderBy("orderIndex", "asc")
    .execute();
  if (cards.length === 0) return [];

  const cardIds = cards.map((c) => c.id);
  const [engagedCounts, knownCounts] = await Promise.all([
    db
      .selectFrom("flashCardProgress")
      .select(["flashCardId", (eb) => eb.fn.countAll().as("count")])
      .where("flashCardId", "in", cardIds)
      .groupBy("flashCardId")
      .execute(),
    db
      .selectFrom("flashCardProgress")
      .select(["flashCardId", (eb) => eb.fn.countAll().as("count")])
      .where("flashCardId", "in", cardIds)
      .where("status", "=", "known")
      .groupBy("flashCardId")
      .execute(),
  ]);
  const engagedByCard = new Map(engagedCounts.map((c) => [c.flashCardId, Number(c.count)]));
  const knownByCard = new Map(knownCounts.map((c) => [c.flashCardId, Number(c.count)]));

  return cards.map((card) => ({
    id: card.id,
    chapterId: card.chapterId,
    front: card.front,
    back: card.back,
    orderIndex: card.orderIndex,
    studentsEngaged: engagedByCard.get(card.id) ?? 0,
    studentsMastered: knownByCard.get(card.id) ?? 0,
  }));
}

export async function createFlashCard(chapterId: number, input: CreateFlashCardInput, createdBy: number) {
  const chapter = await db.selectFrom("chapters").select("id").where("id", "=", chapterId).executeTakeFirst();
  if (!chapter) throw new ApiError(404, "Chapter not found");

  const last = await db
    .selectFrom("flashCards")
    .select("orderIndex")
    .where("chapterId", "=", chapterId)
    .orderBy("orderIndex", "desc")
    .executeTakeFirst();
  const orderIndex = (last?.orderIndex ?? -1) + 1;

  const result = await db
    .insertInto("flashCards")
    .values({ chapterId, front: input.front, back: input.back, orderIndex, createdBy, updatedAt: new Date() })
    .executeTakeFirstOrThrow();
  return db.selectFrom("flashCards").selectAll().where("id", "=", Number(result.insertId)).executeTakeFirstOrThrow();
}

export async function deleteFlashCard(id: number) {
  const card = await db.selectFrom("flashCards").select("id").where("id", "=", id).executeTakeFirst();
  if (!card) throw new ApiError(404, "Flash card not found");
  await db.deleteFrom("flashCards").where("id", "=", id).execute();
}

export async function reorderFlashCard(id: number, direction: "up" | "down") {
  const card = await db.selectFrom("flashCards").selectAll().where("id", "=", id).executeTakeFirst();
  if (!card) throw new ApiError(404, "Flash card not found");

  const sibling = await db
    .selectFrom("flashCards")
    .selectAll()
    .where("chapterId", "=", card.chapterId)
    .where("orderIndex", direction === "up" ? "<" : ">", card.orderIndex)
    .orderBy("orderIndex", direction === "up" ? "desc" : "asc")
    .executeTakeFirst();
  if (!sibling) return;

  await db.transaction().execute(async (trx) => {
    await trx
      .updateTable("flashCards")
      .set({ orderIndex: sibling.orderIndex, updatedAt: new Date() })
      .where("id", "=", card.id)
      .execute();
    await trx
      .updateTable("flashCards")
      .set({ orderIndex: card.orderIndex, updatedAt: new Date() })
      .where("id", "=", sibling.id)
      .execute();
  });
}

export async function updateProgress(userId: number, flashCardId: number, input: UpdateProgressInput) {
  const card = await db.selectFrom("flashCards").select("id").where("id", "=", flashCardId).executeTakeFirst();
  if (!card) throw new ApiError(404, "Flash card not found");

  const status = input.status ?? "new";
  const isFavorite = input.isFavorite ?? false;
  const now = new Date();

  await db
    .insertInto("flashCardProgress")
    .values({
      userId,
      flashCardId,
      status,
      isFavorite,
      reviewCount: input.incrementReview ? 1 : 0,
      lastReviewedAt: input.incrementReview ? now : null,
    })
    .onDuplicateKeyUpdate({
      userId,
      ...(input.status !== undefined ? { status } : {}),
      ...(input.isFavorite !== undefined ? { isFavorite } : {}),
      ...(input.incrementReview ? { reviewCount: sql`review_count + 1`, lastReviewedAt: now } : {}),
    })
    .execute();

  return db
    .selectFrom("flashCardProgress")
    .selectAll()
    .where("userId", "=", userId)
    .where("flashCardId", "=", flashCardId)
    .executeTakeFirstOrThrow();
}
