import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { CreateChapterInput, UpdateChapterInput } from "./schema";

export async function listChapters(subjectId: number) {
  return prisma.chapter.findMany({
    where: { subjectId },
    orderBy: { orderIndex: "asc" },
  });
}

export async function createChapter(subjectId: number, input: CreateChapterInput) {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  let orderIndex = input.orderIndex;
  if (orderIndex === undefined) {
    const last = await prisma.chapter.findFirst({
      where: { subjectId },
      orderBy: { orderIndex: "desc" },
    });
    orderIndex = (last?.orderIndex ?? -1) + 1;
  }

  return prisma.chapter.create({
    data: { subjectId, title: input.title, orderIndex },
  });
}

export async function updateChapter(subjectId: number, id: number, input: UpdateChapterInput) {
  const chapter = await prisma.chapter.findFirst({ where: { id, subjectId } });
  if (!chapter) {
    throw new ApiError(404, "Chapter not found");
  }

  return prisma.chapter.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.orderIndex !== undefined ? { orderIndex: input.orderIndex } : {}),
    },
  });
}

export async function deleteChapter(subjectId: number, id: number) {
  const chapter = await prisma.chapter.findFirst({ where: { id, subjectId } });
  if (!chapter) {
    throw new ApiError(404, "Chapter not found");
  }
  await prisma.chapter.delete({ where: { id } });
}
