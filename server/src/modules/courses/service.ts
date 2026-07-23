import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { slugify } from "../../utils/slugify";
import { CreateCourseInput, UpdateCourseInput } from "./schema";

async function uniqueSlug(title: string, excludeId?: number): Promise<string> {
  const base = slugify(title) || "course";
  let candidate = base;
  let suffix = 1;

  while (
    await db
      .selectFrom("courses")
      .select("id")
      .where("slug", "=", candidate)
      .$if(excludeId !== undefined, (qb) => qb.where("id", "!=", excludeId as number))
      .executeTakeFirst()
  ) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}

export async function listCourses(includeUnpublished: boolean, featuredOnly = false) {
  const courses = await db
    .selectFrom("courses")
    .selectAll()
    .$if(!includeUnpublished, (qb) => qb.where("isPublished", "=", true))
    .$if(featuredOnly, (qb) => qb.where("isFeatured", "=", true))
    .orderBy("createdAt", "desc")
    .execute();

  if (courses.length === 0) return [];

  const ids = courses.map((c) => c.id);
  const [subjectCounts, enrollmentCounts] = await Promise.all([
    db
      .selectFrom("subjects")
      .select(["courseId", (eb) => eb.fn.countAll().as("count")])
      .where("courseId", "in", ids)
      .groupBy("courseId")
      .execute(),
    db
      .selectFrom("enrollments")
      .select(["courseId", (eb) => eb.fn.countAll().as("count")])
      .where("courseId", "in", ids)
      .groupBy("courseId")
      .execute(),
  ]);
  const subjectCountByCourse = new Map(subjectCounts.map((c) => [c.courseId, Number(c.count)]));
  const enrollmentCountByCourse = new Map(enrollmentCounts.map((c) => [c.courseId, Number(c.count)]));

  return courses.map((c) => ({
    ...c,
    _count: {
      subjects: subjectCountByCourse.get(c.id) ?? 0,
      enrollments: enrollmentCountByCourse.get(c.id) ?? 0,
    },
  }));
}

async function attachSyllabus<T extends { id: number }>(courses: T[]) {
  if (courses.length === 0) return courses.map((c) => ({ ...c, subjects: [] }));

  const courseIds = courses.map((c) => c.id);
  const subjects = await db
    .selectFrom("subjects")
    .selectAll()
    .where("courseId", "in", courseIds)
    .orderBy("orderIndex", "asc")
    .execute();

  const subjectIds = subjects.map((s) => s.id);
  const chapters = subjectIds.length
    ? await db
        .selectFrom("chapters")
        .selectAll()
        .where("subjectId", "in", subjectIds)
        .orderBy("orderIndex", "asc")
        .execute()
    : [];
  const chaptersBySubject = new Map<number, typeof chapters>();
  for (const chapter of chapters) {
    const list = chaptersBySubject.get(chapter.subjectId) ?? [];
    list.push(chapter);
    chaptersBySubject.set(chapter.subjectId, list);
  }

  const subjectsByCourse = new Map<number, (typeof subjects[number] & { chapters: typeof chapters })[]>();
  for (const subject of subjects) {
    if (subject.courseId === null) continue;
    const list = subjectsByCourse.get(subject.courseId) ?? [];
    list.push({ ...subject, chapters: chaptersBySubject.get(subject.id) ?? [] });
    subjectsByCourse.set(subject.courseId, list);
  }

  return courses.map((c) => ({ ...c, subjects: subjectsByCourse.get(c.id) ?? [] }));
}

export async function listCoursesWithSyllabus() {
  const courses = await db
    .selectFrom("courses")
    .selectAll()
    .where("isPublished", "=", true)
    .orderBy("createdAt", "desc")
    .execute();
  return attachSyllabus(courses);
}

export async function getCourseById(id: number) {
  const course = await db.selectFrom("courses").selectAll().where("id", "=", id).executeTakeFirst();
  if (!course) throw new ApiError(404, "Course not found");

  const [withSyllabus] = await attachSyllabus([course]);
  return withSyllabus;
}

export async function createCourse(input: CreateCourseInput, createdBy: number) {
  const slug = await uniqueSlug(input.title);
  const isPaid = input.isPaid ?? false;
  const result = await db
    .insertInto("courses")
    .values({
      title: input.title,
      slug,
      description: input.description,
      isPublished: input.isPublished ?? true,
      isFeatured: input.isFeatured ?? false,
      isPaid,
      price: isPaid && input.price !== undefined && input.price !== null ? String(input.price) : null,
      createdBy,
      updatedAt: new Date(),
    })
    .executeTakeFirstOrThrow();
  return db.selectFrom("courses").selectAll().where("id", "=", Number(result.insertId)).executeTakeFirstOrThrow();
}

export async function updateCourse(id: number, input: UpdateCourseInput) {
  const existing = await db.selectFrom("courses").selectAll().where("id", "=", id).executeTakeFirst();
  if (!existing) throw new ApiError(404, "Course not found");

  const slug = input.title ? await uniqueSlug(input.title, id) : undefined;

  await db
    .updateTable("courses")
    .set({
      ...(input.title ? { title: input.title, slug } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
      ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
      ...(input.isPaid !== undefined ? { isPaid: input.isPaid } : {}),
      ...(input.price !== undefined
        ? { price: input.isPaid === false ? null : input.price !== null ? String(input.price) : null }
        : {}),
      updatedAt: new Date(),
    })
    .where("id", "=", id)
    .execute();
  return db.selectFrom("courses").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}

export async function deleteCourse(id: number) {
  const existing = await db.selectFrom("courses").select("id").where("id", "=", id).executeTakeFirst();
  if (!existing) throw new ApiError(404, "Course not found");
  await db.deleteFrom("courses").where("id", "=", id).execute();
}

export async function setCoverImage(id: number, filename: string) {
  const existing = await db.selectFrom("courses").select("id").where("id", "=", id).executeTakeFirst();
  if (!existing) throw new ApiError(404, "Course not found");

  await db
    .updateTable("courses")
    .set({ coverImageUrl: `/uploads/course-covers/${filename}`, updatedAt: new Date() })
    .where("id", "=", id)
    .execute();
  return db.selectFrom("courses").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}

export async function setPaymentQr(id: number, filename: string) {
  const existing = await db.selectFrom("courses").select("id").where("id", "=", id).executeTakeFirst();
  if (!existing) throw new ApiError(404, "Course not found");

  await db
    .updateTable("courses")
    .set({ paymentQrImagePath: `/uploads/course-qr/${filename}`, updatedAt: new Date() })
    .where("id", "=", id)
    .execute();
  return db.selectFrom("courses").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}
