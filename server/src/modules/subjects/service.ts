import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import {
  AssignSubjectInput,
  CreateStandaloneSubjectInput,
  CreateSubjectInput,
  UpdateSubjectInput,
} from "./schema";

export async function listSubjects(courseId: number) {
  return prisma.subject.findMany({
    where: { courseId },
    orderBy: { orderIndex: "asc" },
    include: { _count: { select: { chapters: true } } },
  });
}

export async function listAllSubjects(filter: { unassigned?: boolean } = {}) {
  return prisma.subject.findMany({
    where: filter.unassigned ? { courseId: null } : {},
    orderBy: [{ courseId: "asc" }, { orderIndex: "asc" }],
    include: {
      _count: { select: { chapters: true } },
      course: { select: { id: true, title: true } },
    },
  });
}

export async function createStandaloneSubject(input: CreateStandaloneSubjectInput) {
  const courseId = input.courseId ?? null;

  if (courseId !== null) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new ApiError(404, "Course not found");
  }

  let orderIndex = input.orderIndex;
  if (orderIndex === undefined) {
    const last = await prisma.subject.findFirst({ where: { courseId }, orderBy: { orderIndex: "desc" } });
    orderIndex = (last?.orderIndex ?? -1) + 1;
  }

  return prisma.subject.create({ data: { courseId, title: input.title, orderIndex } });
}

export async function assignSubjectToCourse(id: number, input: AssignSubjectInput) {
  const subject = await prisma.subject.findUnique({ where: { id } });
  if (!subject) throw new ApiError(404, "Subject not found");

  const courseId = input.courseId;
  if (courseId !== null) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new ApiError(404, "Course not found");
  }

  const last = await prisma.subject.findFirst({ where: { courseId }, orderBy: { orderIndex: "desc" } });
  const orderIndex = (last?.orderIndex ?? -1) + 1;

  return prisma.subject.update({ where: { id }, data: { courseId, orderIndex } });
}

export async function updateSubjectById(id: number, input: UpdateSubjectInput) {
  const subject = await prisma.subject.findUnique({ where: { id } });
  if (!subject) throw new ApiError(404, "Subject not found");

  return prisma.subject.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.orderIndex !== undefined ? { orderIndex: input.orderIndex } : {}),
    },
  });
}

export async function deleteSubjectById(id: number) {
  const subject = await prisma.subject.findUnique({ where: { id } });
  if (!subject) throw new ApiError(404, "Subject not found");
  await prisma.subject.delete({ where: { id } });
}

export async function getSubjectById(id: number) {
  const subject = await prisma.subject.findUnique({
    where: { id },
    include: { chapters: { orderBy: { orderIndex: "asc" } }, course: true },
  });
  if (!subject) throw new ApiError(404, "Subject not found");
  return subject;
}

export async function createSubject(courseId: number, input: CreateSubjectInput) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new ApiError(404, "Course not found");

  let orderIndex = input.orderIndex;
  if (orderIndex === undefined) {
    const last = await prisma.subject.findFirst({ where: { courseId }, orderBy: { orderIndex: "desc" } });
    orderIndex = (last?.orderIndex ?? -1) + 1;
  }

  return prisma.subject.create({ data: { courseId, title: input.title, orderIndex } });
}

export async function updateSubject(courseId: number, id: number, input: UpdateSubjectInput) {
  const subject = await prisma.subject.findFirst({ where: { id, courseId } });
  if (!subject) throw new ApiError(404, "Subject not found");

  return prisma.subject.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.orderIndex !== undefined ? { orderIndex: input.orderIndex } : {}),
    },
  });
}

export async function deleteSubject(courseId: number, id: number) {
  const subject = await prisma.subject.findFirst({ where: { id, courseId } });
  if (!subject) throw new ApiError(404, "Subject not found");
  await prisma.subject.delete({ where: { id } });
}
