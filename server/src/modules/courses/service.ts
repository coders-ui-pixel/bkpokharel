import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { slugify } from "../../utils/slugify";
import { CreateCourseInput, UpdateCourseInput } from "./schema";

async function uniqueSlug(title: string, excludeId?: number): Promise<string> {
  const base = slugify(title) || "course";
  let candidate = base;
  let suffix = 1;

  while (
    await prisma.course.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
    })
  ) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return candidate;
}

export async function listCourses(includeUnpublished: boolean, featuredOnly = false) {
  return prisma.course.findMany({
    where: {
      ...(includeUnpublished ? {} : { isPublished: true }),
      ...(featuredOnly ? { isFeatured: true } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { subjects: true, enrollments: true } } },
  });
}

export async function listCoursesWithSyllabus() {
  return prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    include: {
      subjects: {
        orderBy: { orderIndex: "asc" },
        include: { chapters: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });
}

export async function getCourseById(id: number) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      subjects: {
        orderBy: { orderIndex: "asc" },
        include: { chapters: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return course;
}

export async function createCourse(input: CreateCourseInput, createdBy: number) {
  const slug = await uniqueSlug(input.title);
  return prisma.course.create({
    data: {
      title: input.title,
      slug,
      description: input.description,
      isPublished: input.isPublished ?? true,
      isFeatured: input.isFeatured ?? false,
      isPaid: input.isPaid ?? false,
      price: input.isPaid ? input.price : null,
      createdBy,
    },
  });
}

export async function updateCourse(id: number, input: UpdateCourseInput) {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Course not found");
  }

  const slug = input.title ? await uniqueSlug(input.title, id) : undefined;

  return prisma.course.update({
    where: { id },
    data: {
      ...(input.title ? { title: input.title, slug } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
      ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
      ...(input.isPaid !== undefined ? { isPaid: input.isPaid } : {}),
      ...(input.price !== undefined ? { price: input.isPaid === false ? null : input.price } : {}),
    },
  });
}

export async function deleteCourse(id: number) {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Course not found");
  }
  await prisma.course.delete({ where: { id } });
}

export async function setCoverImage(id: number, filename: string) {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Course not found");

  return prisma.course.update({
    where: { id },
    data: { coverImageUrl: `/uploads/course-covers/${filename}` },
  });
}

export async function setPaymentQr(id: number, filename: string) {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Course not found");

  return prisma.course.update({
    where: { id },
    data: { paymentQrImagePath: `/uploads/course-qr/${filename}` },
  });
}
