import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { CreateQuestionSetInput, SetItemsInput, UpdateQuestionSetInput } from "./schema";

export async function listQuestionSets(
  filters: { chapterId?: number; subjectId?: number; courseId?: number },
  includeUnpublished: boolean
) {
  const sets = await db
    .selectFrom("questionSets")
    .leftJoin("chapters as qsChapter", "qsChapter.id", "questionSets.chapterId")
    .leftJoin("subjects as qsSubject", "qsSubject.id", "questionSets.subjectId")
    .leftJoin("subjects as chapterSubject", "chapterSubject.id", "qsChapter.subjectId")
    .select([
      "questionSets.id as id",
      "questionSets.title as title",
      "questionSets.chapterId as chapterId",
      "questionSets.subjectId as subjectId",
      "questionSets.difficulty as difficulty",
      "questionSets.negativeMarking as negativeMarking",
      "questionSets.estimatedMinutes as estimatedMinutes",
      "questionSets.isPublished as isPublished",
      "questionSets.createdBy as createdBy",
      "questionSets.createdAt as createdAt",
      "questionSets.updatedAt as updatedAt",
      "qsChapter.id as chapterRefId",
      "qsChapter.title as chapterTitle",
      "qsChapter.orderIndex as chapterOrderIndex",
      "qsSubject.id as subjectRefId",
      "qsSubject.title as subjectTitle",
      "qsSubject.orderIndex as subjectOrderIndex",
    ])
    .$if(!includeUnpublished, (qb) => qb.where("questionSets.isPublished", "=", true))
    .$if(filters.chapterId !== undefined, (qb) => qb.where("questionSets.chapterId", "=", filters.chapterId as number))
    .$if(filters.subjectId !== undefined, (qb) => qb.where("questionSets.subjectId", "=", filters.subjectId as number))
    .$if(filters.courseId !== undefined, (qb) =>
      qb.where((eb) =>
        eb.or([
          eb("qsSubject.courseId", "=", filters.courseId as number),
          eb("chapterSubject.courseId", "=", filters.courseId as number),
        ])
      )
    )
    .orderBy("questionSets.createdAt", "desc")
    .execute();

  if (sets.length === 0) return [];

  const counts = await db
    .selectFrom("questionSetItems")
    .select(["questionSetId", (eb) => eb.fn.countAll().as("count")])
    .where(
      "questionSetId",
      "in",
      sets.map((s) => s.id)
    )
    .groupBy("questionSetId")
    .execute();
  const countBySet = new Map(counts.map((c) => [c.questionSetId, Number(c.count)]));

  return sets.map((s) => ({
    id: s.id,
    title: s.title,
    chapterId: s.chapterId,
    subjectId: s.subjectId,
    difficulty: s.difficulty,
    negativeMarking: s.negativeMarking,
    estimatedMinutes: s.estimatedMinutes,
    isPublished: s.isPublished,
    createdBy: s.createdBy,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    _count: { items: countBySet.get(s.id) ?? 0 },
    chapter: s.chapterRefId !== null ? { id: s.chapterRefId, title: s.chapterTitle, orderIndex: s.chapterOrderIndex } : null,
    subject: s.subjectRefId !== null ? { id: s.subjectRefId, title: s.subjectTitle, orderIndex: s.subjectOrderIndex } : null,
  }));
}

export async function getQuestionSetForAdmin(id: number) {
  const set = await db.selectFrom("questionSets").selectAll().where("id", "=", id).executeTakeFirst();
  if (!set) throw new ApiError(404, "Question set not found");

  const items = await db
    .selectFrom("questionSetItems")
    .innerJoin("questions", "questions.id", "questionSetItems.questionId")
    .selectAll("questions")
    .select(["questionSetItems.id as itemId", "questionSetItems.orderIndex as itemOrderIndex"])
    .where("questionSetItems.questionSetId", "=", id)
    .orderBy("questionSetItems.orderIndex", "asc")
    .execute();

  return {
    ...set,
    items: items.map((item) => ({
      id: item.itemId,
      orderIndex: item.itemOrderIndex,
      question: {
        id: item.id,
        chapterId: item.chapterId,
        subjectId: item.subjectId,
        questionText: item.questionText,
        optionA: item.optionA,
        optionB: item.optionB,
        optionC: item.optionC,
        optionD: item.optionD,
        correctOption: item.correctOption,
        marks: item.marks,
        difficulty: item.difficulty,
        tags: item.tags,
        explanation: item.explanation,
        isActive: item.isActive,
        createdBy: item.createdBy,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    })),
  };
}

export async function getQuestionSetSummary(id: number, userId?: number) {
  const set = await db.selectFrom("questionSets").selectAll().where("id", "=", id).executeTakeFirst();
  if (!set || !set.isPublished) throw new ApiError(404, "Question set not found");

  const itemCountRow = await db
    .selectFrom("questionSetItems")
    .select((eb) => eb.fn.countAll().as("count"))
    .where("questionSetId", "=", id)
    .executeTakeFirstOrThrow();

  const totalMarksRow = await db
    .selectFrom("questionSetItems")
    .innerJoin("questions", "questions.id", "questionSetItems.questionId")
    .select((eb) => eb.fn.sum<string>("questions.marks").as("total"))
    .where("questionSetItems.questionSetId", "=", id)
    .executeTakeFirst();

  const attemptRow = await db
    .selectFrom("practiceAttempts")
    .select((eb) => [eb.fn.countAll().as("count"), eb.fn.avg<string>("score").as("avg"), eb.fn.max<string>("score").as("max")])
    .where("questionSetId", "=", id)
    .where("status", "=", "submitted")
    .$if(userId !== undefined, (qb) => qb.where("userId", "=", userId as number))
    .executeTakeFirstOrThrow();

  return {
    id: set.id,
    title: set.title,
    difficulty: set.difficulty,
    negativeMarking: set.negativeMarking,
    estimatedMinutes: set.estimatedMinutes,
    questionCount: Number(itemCountRow.count),
    totalMarks: totalMarksRow?.total ?? 0,
    attempts: Number(attemptRow.count),
    averageScore: attemptRow.avg,
    bestScore: attemptRow.max,
  };
}

export async function createQuestionSet(input: CreateQuestionSetInput, createdBy: number) {
  const result = await db
    .insertInto("questionSets")
    .values({
      title: input.title,
      chapterId: input.chapterId ?? null,
      subjectId: input.subjectId ?? null,
      difficulty: input.difficulty,
      negativeMarking: String(input.negativeMarking),
      estimatedMinutes: input.estimatedMinutes,
      isPublished: input.isPublished ?? true,
      createdBy,
      updatedAt: new Date(),
    })
    .executeTakeFirstOrThrow();
  return db.selectFrom("questionSets").selectAll().where("id", "=", Number(result.insertId)).executeTakeFirstOrThrow();
}

export async function updateQuestionSet(id: number, input: UpdateQuestionSetInput) {
  const existing = await db.selectFrom("questionSets").select("id").where("id", "=", id).executeTakeFirst();
  if (!existing) throw new ApiError(404, "Question set not found");

  await db
    .updateTable("questionSets")
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.chapterId !== undefined ? { chapterId: input.chapterId } : {}),
      ...(input.subjectId !== undefined ? { subjectId: input.subjectId } : {}),
      ...(input.difficulty !== undefined ? { difficulty: input.difficulty } : {}),
      ...(input.negativeMarking !== undefined ? { negativeMarking: String(input.negativeMarking) } : {}),
      ...(input.estimatedMinutes !== undefined ? { estimatedMinutes: input.estimatedMinutes } : {}),
      ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
      updatedAt: new Date(),
    })
    .where("id", "=", id)
    .execute();
  return db.selectFrom("questionSets").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}

export async function deleteQuestionSet(id: number) {
  const existing = await db.selectFrom("questionSets").select("id").where("id", "=", id).executeTakeFirst();
  if (!existing) throw new ApiError(404, "Question set not found");
  await db.deleteFrom("questionSets").where("id", "=", id).execute();
}

export async function setQuestionSetItems(id: number, input: SetItemsInput) {
  const existing = await db.selectFrom("questionSets").select("id").where("id", "=", id).executeTakeFirst();
  if (!existing) throw new ApiError(404, "Question set not found");

  await db.transaction().execute(async (trx) => {
    await trx.deleteFrom("questionSetItems").where("questionSetId", "=", id).execute();
    if (input.questionIds.length > 0) {
      await trx
        .insertInto("questionSetItems")
        .values(input.questionIds.map((questionId, index) => ({ questionSetId: id, questionId, orderIndex: index })))
        .execute();
    }
  });

  return getQuestionSetForAdmin(id);
}
