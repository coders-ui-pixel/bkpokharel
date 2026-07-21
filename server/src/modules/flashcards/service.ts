import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { CreateFlashCardInput, UpdateProgressInput } from "./schema";

export async function assertCanAccessChapter(userId: number, chapterId: number) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { subject: true },
  });
  if (!chapter) throw new ApiError(404, "Chapter not found");
  if (chapter.subject.courseId === null) {
    throw new ApiError(403, "This chapter's subject is not yet assigned to a course");
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: chapter.subject.courseId } },
  });
  if (!enrollment || enrollment.status !== "approved") {
    throw new ApiError(403, "You must be enrolled in this course to view this");
  }
}

export async function listForChapter(chapterId: number, userId: number) {
  const cards = await prisma.flashCard.findMany({
    where: { chapterId },
    orderBy: { orderIndex: "asc" },
    include: { progress: { where: { userId } } },
  });

  return cards.map((card) => {
    const progress = card.progress[0];
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
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment || enrollment.status !== "approved") {
    throw new ApiError(403, "You must be enrolled in this course to view this");
  }
}

export async function listForCourse(courseId: number, userId: number) {
  const cards = await prisma.flashCard.findMany({
    where: { chapter: { subject: { courseId } } },
    include: {
      progress: { where: { userId } },
      chapter: {
        select: {
          id: true,
          title: true,
          orderIndex: true,
          subject: { select: { id: true, title: true, orderIndex: true } },
        },
      },
    },
  });

  cards.sort((a, b) => {
    if (a.chapter.subject.orderIndex !== b.chapter.subject.orderIndex) {
      return a.chapter.subject.orderIndex - b.chapter.subject.orderIndex;
    }
    if (a.chapter.orderIndex !== b.chapter.orderIndex) {
      return a.chapter.orderIndex - b.chapter.orderIndex;
    }
    return a.orderIndex - b.orderIndex;
  });

  return cards.map((card) => {
    const progress = card.progress[0];
    return {
      id: card.id,
      chapterId: card.chapterId,
      chapterTitle: card.chapter.title,
      subjectId: card.chapter.subject.id,
      subjectTitle: card.chapter.subject.title,
      front: card.front,
      back: card.back,
      status: progress?.status ?? "new",
      isFavorite: progress?.isFavorite ?? false,
      reviewCount: progress?.reviewCount ?? 0,
    };
  });
}

export async function listForChapterAdmin(chapterId: number) {
  const cards = await prisma.flashCard.findMany({
    where: { chapterId },
    orderBy: { orderIndex: "asc" },
    include: { _count: { select: { progress: true } } },
  });

  const knownCounts = await prisma.flashCardProgress.groupBy({
    by: ["flashCardId"],
    where: { flashCardId: { in: cards.map((c) => c.id) }, status: "known" },
    _count: { flashCardId: true },
  });
  const knownByCard = new Map(knownCounts.map((k) => [k.flashCardId, k._count.flashCardId]));

  return cards.map((card) => ({
    id: card.id,
    chapterId: card.chapterId,
    front: card.front,
    back: card.back,
    orderIndex: card.orderIndex,
    studentsEngaged: card._count.progress,
    studentsMastered: knownByCard.get(card.id) ?? 0,
  }));
}

export async function createFlashCard(chapterId: number, input: CreateFlashCardInput, createdBy: number) {
  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (!chapter) throw new ApiError(404, "Chapter not found");

  const last = await prisma.flashCard.findFirst({ where: { chapterId }, orderBy: { orderIndex: "desc" } });
  const orderIndex = (last?.orderIndex ?? -1) + 1;

  return prisma.flashCard.create({
    data: { chapterId, front: input.front, back: input.back, orderIndex, createdBy },
  });
}

export async function deleteFlashCard(id: number) {
  const card = await prisma.flashCard.findUnique({ where: { id } });
  if (!card) throw new ApiError(404, "Flash card not found");
  await prisma.flashCard.delete({ where: { id } });
}

export async function reorderFlashCard(id: number, direction: "up" | "down") {
  const card = await prisma.flashCard.findUnique({ where: { id } });
  if (!card) throw new ApiError(404, "Flash card not found");

  const sibling = await prisma.flashCard.findFirst({
    where: {
      chapterId: card.chapterId,
      orderIndex: direction === "up" ? { lt: card.orderIndex } : { gt: card.orderIndex },
    },
    orderBy: { orderIndex: direction === "up" ? "desc" : "asc" },
  });
  if (!sibling) return;

  await prisma.$transaction([
    prisma.flashCard.update({ where: { id: card.id }, data: { orderIndex: sibling.orderIndex } }),
    prisma.flashCard.update({ where: { id: sibling.id }, data: { orderIndex: card.orderIndex } }),
  ]);
}

export async function updateProgress(userId: number, flashCardId: number, input: UpdateProgressInput) {
  const card = await prisma.flashCard.findUnique({ where: { id: flashCardId } });
  if (!card) throw new ApiError(404, "Flash card not found");

  const existing = await prisma.flashCardProgress.findUnique({
    where: { userId_flashCardId: { userId, flashCardId } },
  });

  const reviewCount = (existing?.reviewCount ?? 0) + (input.incrementReview ? 1 : 0);

  return prisma.flashCardProgress.upsert({
    where: { userId_flashCardId: { userId, flashCardId } },
    create: {
      userId,
      flashCardId,
      status: input.status ?? "new",
      isFavorite: input.isFavorite ?? false,
      reviewCount,
      lastReviewedAt: input.incrementReview ? new Date() : undefined,
    },
    update: {
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.isFavorite !== undefined ? { isFavorite: input.isFavorite } : {}),
      ...(input.incrementReview ? { reviewCount, lastReviewedAt: new Date() } : {}),
    },
  });
}
