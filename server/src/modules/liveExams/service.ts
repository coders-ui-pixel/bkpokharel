import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { CreateLiveExamInput, UpdateLiveExamInput } from "./schema";

function computeStatus(exam: { status: string; startsAt: Date; endsAt: Date }): string {
  if (exam.status === "cancelled") return "cancelled";
  const now = new Date();
  if (now < exam.startsAt) return "scheduled";
  if (now > exam.endsAt) return "completed";
  return "live";
}

function withComputedStatus<T extends { status: string; startsAt: Date; endsAt: Date }>(exam: T) {
  return { ...exam, status: computeStatus(exam) };
}

export async function listLiveExams() {
  const exams = await db
    .selectFrom("liveExams")
    .innerJoin("questionSets", "questionSets.id", "liveExams.questionSetId")
    .leftJoin("courses", "courses.id", "liveExams.courseId")
    .select([
      "liveExams.id as id",
      "liveExams.title as title",
      "liveExams.questionSetId as questionSetId",
      "liveExams.courseId as courseId",
      "liveExams.startsAt as startsAt",
      "liveExams.endsAt as endsAt",
      "liveExams.status as status",
      "liveExams.createdBy as createdBy",
      "liveExams.createdAt as createdAt",
      "liveExams.updatedAt as updatedAt",
      "questionSets.title as questionSetTitle",
      "courses.title as courseTitle",
    ])
    .orderBy("liveExams.startsAt", "desc")
    .execute();

  if (exams.length === 0) return [];

  const counts = await db
    .selectFrom("questionSetItems")
    .select(["questionSetId", (eb) => eb.fn.countAll().as("count")])
    .where(
      "questionSetId",
      "in",
      exams.map((e) => e.questionSetId)
    )
    .groupBy("questionSetId")
    .execute();
  const countBySet = new Map(counts.map((c) => [c.questionSetId, Number(c.count)]));

  return exams.map((e) =>
    withComputedStatus({
      id: e.id,
      title: e.title,
      questionSetId: e.questionSetId,
      courseId: e.courseId,
      startsAt: e.startsAt,
      endsAt: e.endsAt,
      status: e.status,
      createdBy: e.createdBy,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      questionSet: { title: e.questionSetTitle, _count: { items: countBySet.get(e.questionSetId) ?? 0 } },
      course: e.courseTitle !== null ? { title: e.courseTitle } : null,
    })
  );
}

export async function getLiveExam(id: number) {
  const exam = await db.selectFrom("liveExams").selectAll().where("id", "=", id).executeTakeFirst();
  if (!exam) throw new ApiError(404, "Live exam not found");

  const questionSet = await db
    .selectFrom("questionSets")
    .selectAll()
    .where("id", "=", exam.questionSetId)
    .executeTakeFirstOrThrow();
  const itemCountRow = await db
    .selectFrom("questionSetItems")
    .select((eb) => eb.fn.countAll().as("count"))
    .where("questionSetId", "=", exam.questionSetId)
    .executeTakeFirstOrThrow();

  const course =
    exam.courseId !== null
      ? await db.selectFrom("courses").selectAll().where("id", "=", exam.courseId).executeTakeFirst()
      : null;

  const totalMarksRow = await db
    .selectFrom("questionSetItems")
    .innerJoin("questions", "questions.id", "questionSetItems.questionId")
    .select((eb) => eb.fn.sum<string>("questions.marks").as("total"))
    .where("questionSetItems.questionSetId", "=", exam.questionSetId)
    .executeTakeFirst();

  return {
    ...withComputedStatus(exam),
    questionSet: { ...questionSet, _count: { items: Number(itemCountRow.count) } },
    course: course ?? null,
    totalMarks: totalMarksRow?.total ?? 0,
  };
}

export async function createLiveExam(input: CreateLiveExamInput, createdBy: number) {
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);
  if (endsAt <= startsAt) throw new ApiError(400, "End time must be after start time");

  const questionSet = await db
    .selectFrom("questionSets")
    .select("id")
    .where("id", "=", input.questionSetId)
    .executeTakeFirst();
  if (!questionSet) throw new ApiError(404, "Question set not found");

  const result = await db
    .insertInto("liveExams")
    .values({
      title: input.title,
      questionSetId: input.questionSetId,
      courseId: input.courseId ?? null,
      startsAt,
      endsAt,
      createdBy,
      updatedAt: new Date(),
    })
    .executeTakeFirstOrThrow();
  return db.selectFrom("liveExams").selectAll().where("id", "=", Number(result.insertId)).executeTakeFirstOrThrow();
}

export async function updateLiveExam(id: number, input: UpdateLiveExamInput) {
  const existing = await db.selectFrom("liveExams").select("id").where("id", "=", id).executeTakeFirst();
  if (!existing) throw new ApiError(404, "Live exam not found");

  await db
    .updateTable("liveExams")
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.questionSetId !== undefined ? { questionSetId: input.questionSetId } : {}),
      ...(input.courseId !== undefined ? { courseId: input.courseId } : {}),
      ...(input.startsAt !== undefined ? { startsAt: new Date(input.startsAt) } : {}),
      ...(input.endsAt !== undefined ? { endsAt: new Date(input.endsAt) } : {}),
      updatedAt: new Date(),
    })
    .where("id", "=", id)
    .execute();
  return db.selectFrom("liveExams").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}

export async function cancelLiveExam(id: number) {
  const existing = await db.selectFrom("liveExams").select("id").where("id", "=", id).executeTakeFirst();
  if (!existing) throw new ApiError(404, "Live exam not found");
  await db.updateTable("liveExams").set({ status: "cancelled", updatedAt: new Date() }).where("id", "=", id).execute();
}

export async function deleteLiveExam(id: number) {
  const existing = await db.selectFrom("liveExams").select("id").where("id", "=", id).executeTakeFirst();
  if (!existing) throw new ApiError(404, "Live exam not found");
  await db.deleteFrom("liveExams").where("id", "=", id).execute();
}
