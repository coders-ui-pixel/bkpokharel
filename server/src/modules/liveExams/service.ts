import { prisma } from "../../config/db";
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
  const exams = await prisma.liveExam.findMany({
    include: { questionSet: { select: { title: true, _count: { select: { items: true } } } }, course: { select: { title: true } } },
    orderBy: { startsAt: "desc" },
  });
  return exams.map(withComputedStatus);
}

export async function getLiveExam(id: number) {
  const exam = await prisma.liveExam.findUnique({
    where: { id },
    include: {
      questionSet: { include: { _count: { select: { items: true } } } },
      course: true,
    },
  });
  if (!exam) throw new ApiError(404, "Live exam not found");

  const totalMarksAgg = await prisma.question.aggregate({
    where: { items: { some: { questionSetId: exam.questionSetId } } },
    _sum: { marks: true },
  });

  return { ...withComputedStatus(exam), totalMarks: totalMarksAgg._sum.marks ?? 0 };
}

export async function createLiveExam(input: CreateLiveExamInput, createdBy: number) {
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);
  if (endsAt <= startsAt) throw new ApiError(400, "End time must be after start time");

  const questionSet = await prisma.questionSet.findUnique({ where: { id: input.questionSetId } });
  if (!questionSet) throw new ApiError(404, "Question set not found");

  return prisma.liveExam.create({
    data: {
      title: input.title,
      questionSetId: input.questionSetId,
      courseId: input.courseId,
      startsAt,
      endsAt,
      createdBy,
    },
  });
}

export async function updateLiveExam(id: number, input: UpdateLiveExamInput) {
  const existing = await prisma.liveExam.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Live exam not found");

  return prisma.liveExam.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.questionSetId !== undefined ? { questionSetId: input.questionSetId } : {}),
      ...(input.courseId !== undefined ? { courseId: input.courseId } : {}),
      ...(input.startsAt !== undefined ? { startsAt: new Date(input.startsAt) } : {}),
      ...(input.endsAt !== undefined ? { endsAt: new Date(input.endsAt) } : {}),
    },
  });
}

export async function cancelLiveExam(id: number) {
  const existing = await prisma.liveExam.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Live exam not found");
  await prisma.liveExam.update({ where: { id }, data: { status: "cancelled" } });
}

export async function deleteLiveExam(id: number) {
  const existing = await prisma.liveExam.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Live exam not found");
  await prisma.liveExam.delete({ where: { id } });
}
