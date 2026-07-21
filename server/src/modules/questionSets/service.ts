import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { CreateQuestionSetInput, SetItemsInput, UpdateQuestionSetInput } from "./schema";

export async function listQuestionSets(
  filters: { chapterId?: number; subjectId?: number; courseId?: number },
  includeUnpublished: boolean
) {
  return prisma.questionSet.findMany({
    where: {
      ...(includeUnpublished ? {} : { isPublished: true }),
      ...(filters.chapterId ? { chapterId: filters.chapterId } : {}),
      ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
      ...(filters.courseId
        ? {
            OR: [
              { subject: { courseId: filters.courseId } },
              { chapter: { subject: { courseId: filters.courseId } } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { items: true } },
      chapter: { select: { id: true, title: true, orderIndex: true } },
      subject: { select: { id: true, title: true, orderIndex: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getQuestionSetForAdmin(id: number) {
  const set = await prisma.questionSet.findUnique({
    where: { id },
    include: { items: { include: { question: true }, orderBy: { orderIndex: "asc" } } },
  });
  if (!set) throw new ApiError(404, "Question set not found");
  return set;
}

export async function getQuestionSetSummary(id: number, userId?: number) {
  const set = await prisma.questionSet.findUnique({
    where: { id },
    include: { _count: { select: { items: true } } },
  });
  if (!set || !set.isPublished) throw new ApiError(404, "Question set not found");

  const totalMarksAgg = await prisma.question.aggregate({
    where: { items: { some: { questionSetId: id } } },
    _sum: { marks: true },
  });

  const attemptStats = await prisma.practiceAttempt.aggregate({
    where: { questionSetId: id, userId, status: "submitted" },
    _avg: { score: true },
    _max: { score: true },
    _count: true,
  });

  return {
    id: set.id,
    title: set.title,
    difficulty: set.difficulty,
    negativeMarking: set.negativeMarking,
    estimatedMinutes: set.estimatedMinutes,
    questionCount: set._count.items,
    totalMarks: totalMarksAgg._sum.marks ?? 0,
    attempts: attemptStats._count,
    averageScore: attemptStats._avg.score,
    bestScore: attemptStats._max.score,
  };
}

export async function createQuestionSet(input: CreateQuestionSetInput, createdBy: number) {
  return prisma.questionSet.create({
    data: {
      title: input.title,
      chapterId: input.chapterId,
      subjectId: input.subjectId,
      difficulty: input.difficulty,
      negativeMarking: input.negativeMarking,
      estimatedMinutes: input.estimatedMinutes,
      isPublished: input.isPublished ?? true,
      createdBy,
    },
  });
}

export async function updateQuestionSet(id: number, input: UpdateQuestionSetInput) {
  const existing = await prisma.questionSet.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Question set not found");

  return prisma.questionSet.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.chapterId !== undefined ? { chapterId: input.chapterId } : {}),
      ...(input.subjectId !== undefined ? { subjectId: input.subjectId } : {}),
      ...(input.difficulty !== undefined ? { difficulty: input.difficulty } : {}),
      ...(input.negativeMarking !== undefined ? { negativeMarking: input.negativeMarking } : {}),
      ...(input.estimatedMinutes !== undefined ? { estimatedMinutes: input.estimatedMinutes } : {}),
      ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
    },
  });
}

export async function deleteQuestionSet(id: number) {
  const existing = await prisma.questionSet.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Question set not found");
  await prisma.questionSet.delete({ where: { id } });
}

export async function setQuestionSetItems(id: number, input: SetItemsInput) {
  const existing = await prisma.questionSet.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Question set not found");

  await prisma.$transaction([
    prisma.questionSetItem.deleteMany({ where: { questionSetId: id } }),
    prisma.questionSetItem.createMany({
      data: input.questionIds.map((questionId, index) => ({
        questionSetId: id,
        questionId,
        orderIndex: index,
      })),
    }),
  ]);

  return getQuestionSetForAdmin(id);
}
