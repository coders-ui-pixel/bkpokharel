import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import {
  AssignSubjectInput,
  CreateStandaloneSubjectInput,
  CreateSubjectInput,
  UpdateSubjectInput,
} from "./schema";

async function withChapterCounts<T extends { id: number }>(subjects: T[]) {
  if (subjects.length === 0) return subjects.map((s) => ({ ...s, _count: { chapters: 0 } }));
  const counts = await db
    .selectFrom("chapters")
    .select(["subjectId", (eb) => eb.fn.countAll().as("count")])
    .where(
      "subjectId",
      "in",
      subjects.map((s) => s.id)
    )
    .groupBy("subjectId")
    .execute();
  const countBySubject = new Map(counts.map((c) => [c.subjectId, Number(c.count)]));
  return subjects.map((s) => ({ ...s, _count: { chapters: countBySubject.get(s.id) ?? 0 } }));
}

export async function listSubjects(courseId: number) {
  const subjects = await db
    .selectFrom("subjects")
    .selectAll()
    .where("courseId", "=", courseId)
    .orderBy("orderIndex", "asc")
    .execute();
  return withChapterCounts(subjects);
}

export async function listAllSubjects(filter: { unassigned?: boolean } = {}) {
  let query = db.selectFrom("subjects").selectAll();
  query = filter.unassigned ? query.where("courseId", "is", null) : query;
  const subjects = await query.orderBy("courseId", "asc").orderBy("orderIndex", "asc").execute();

  const withCounts = await withChapterCounts(subjects);
  const courseIds = Array.from(new Set(subjects.map((s) => s.courseId).filter((id): id is number => id !== null)));
  const courses = courseIds.length
    ? await db.selectFrom("courses").select(["id", "title"]).where("id", "in", courseIds).execute()
    : [];
  const courseById = new Map(courses.map((c) => [c.id, c]));

  return withCounts.map((s) => ({ ...s, course: s.courseId !== null ? courseById.get(s.courseId) ?? null : null }));
}

export async function createStandaloneSubject(input: CreateStandaloneSubjectInput) {
  const courseId = input.courseId ?? null;

  if (courseId !== null) {
    const course = await db.selectFrom("courses").select("id").where("id", "=", courseId).executeTakeFirst();
    if (!course) throw new ApiError(404, "Course not found");
  }

  let orderIndex = input.orderIndex;
  if (orderIndex === undefined) {
    const last = await db
      .selectFrom("subjects")
      .select("orderIndex")
      .$if(courseId === null, (qb) => qb.where("courseId", "is", null))
      .$if(courseId !== null, (qb) => qb.where("courseId", "=", courseId as number))
      .orderBy("orderIndex", "desc")
      .executeTakeFirst();
    orderIndex = (last?.orderIndex ?? -1) + 1;
  }

  const result = await db
    .insertInto("subjects")
    .values({ courseId, title: input.title, orderIndex, updatedAt: new Date() })
    .executeTakeFirstOrThrow();
  return db.selectFrom("subjects").selectAll().where("id", "=", Number(result.insertId)).executeTakeFirstOrThrow();
}

export async function assignSubjectToCourse(id: number, input: AssignSubjectInput) {
  const subject = await db.selectFrom("subjects").select("id").where("id", "=", id).executeTakeFirst();
  if (!subject) throw new ApiError(404, "Subject not found");

  const courseId = input.courseId;
  if (courseId !== null) {
    const course = await db.selectFrom("courses").select("id").where("id", "=", courseId).executeTakeFirst();
    if (!course) throw new ApiError(404, "Course not found");
  }

  const last = await db
    .selectFrom("subjects")
    .select("orderIndex")
    .$if(courseId === null, (qb) => qb.where("courseId", "is", null))
    .$if(courseId !== null, (qb) => qb.where("courseId", "=", courseId as number))
    .orderBy("orderIndex", "desc")
    .executeTakeFirst();
  const orderIndex = (last?.orderIndex ?? -1) + 1;

  await db
    .updateTable("subjects")
    .set({ courseId, orderIndex, updatedAt: new Date() })
    .where("id", "=", id)
    .execute();
  return db.selectFrom("subjects").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}

export async function updateSubjectById(id: number, input: UpdateSubjectInput) {
  const subject = await db.selectFrom("subjects").select("id").where("id", "=", id).executeTakeFirst();
  if (!subject) throw new ApiError(404, "Subject not found");

  await db
    .updateTable("subjects")
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.orderIndex !== undefined ? { orderIndex: input.orderIndex } : {}),
      updatedAt: new Date(),
    })
    .where("id", "=", id)
    .execute();
  return db.selectFrom("subjects").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}

export async function deleteSubjectById(id: number) {
  const subject = await db.selectFrom("subjects").select("id").where("id", "=", id).executeTakeFirst();
  if (!subject) throw new ApiError(404, "Subject not found");
  await db.deleteFrom("subjects").where("id", "=", id).execute();
}

export async function getSubjectById(id: number) {
  const subject = await db.selectFrom("subjects").selectAll().where("id", "=", id).executeTakeFirst();
  if (!subject) throw new ApiError(404, "Subject not found");

  const chapters = await db
    .selectFrom("chapters")
    .selectAll()
    .where("subjectId", "=", id)
    .orderBy("orderIndex", "asc")
    .execute();
  const course =
    subject.courseId !== null
      ? await db.selectFrom("courses").selectAll().where("id", "=", subject.courseId).executeTakeFirst()
      : null;

  return { ...subject, chapters, course: course ?? null };
}

export async function createSubject(courseId: number, input: CreateSubjectInput) {
  const course = await db.selectFrom("courses").select("id").where("id", "=", courseId).executeTakeFirst();
  if (!course) throw new ApiError(404, "Course not found");

  let orderIndex = input.orderIndex;
  if (orderIndex === undefined) {
    const last = await db
      .selectFrom("subjects")
      .select("orderIndex")
      .where("courseId", "=", courseId)
      .orderBy("orderIndex", "desc")
      .executeTakeFirst();
    orderIndex = (last?.orderIndex ?? -1) + 1;
  }

  const result = await db
    .insertInto("subjects")
    .values({ courseId, title: input.title, orderIndex, updatedAt: new Date() })
    .executeTakeFirstOrThrow();
  return db.selectFrom("subjects").selectAll().where("id", "=", Number(result.insertId)).executeTakeFirstOrThrow();
}

export async function updateSubject(courseId: number, id: number, input: UpdateSubjectInput) {
  const subject = await db
    .selectFrom("subjects")
    .select("id")
    .where("id", "=", id)
    .where("courseId", "=", courseId)
    .executeTakeFirst();
  if (!subject) throw new ApiError(404, "Subject not found");

  await db
    .updateTable("subjects")
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.orderIndex !== undefined ? { orderIndex: input.orderIndex } : {}),
      updatedAt: new Date(),
    })
    .where("id", "=", id)
    .execute();
  return db.selectFrom("subjects").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}

export async function deleteSubject(courseId: number, id: number) {
  const subject = await db
    .selectFrom("subjects")
    .select("id")
    .where("id", "=", id)
    .where("courseId", "=", courseId)
    .executeTakeFirst();
  if (!subject) throw new ApiError(404, "Subject not found");
  await db.deleteFrom("subjects").where("id", "=", id).execute();
}
