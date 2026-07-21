import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import * as gamificationService from "../gamification/service";
import { XP_RULES } from "../gamification/badges";
import { CreateStudyTaskInput, UpdateStudyTaskInput } from "./schema";

export async function listForUser(userId: number) {
  return prisma.studyTask.findMany({
    where: { userId },
    orderBy: { dueAt: "asc" },
  });
}

export async function createTask(userId: number, input: CreateStudyTaskInput) {
  return prisma.studyTask.create({
    data: {
      userId,
      title: input.title,
      notes: input.notes,
      dueAt: input.dueAt,
      priority: input.priority,
    },
  });
}

async function assertOwnsTask(userId: number, id: number) {
  const task = await prisma.studyTask.findUnique({ where: { id } });
  if (!task) throw new ApiError(404, "Task not found");
  if (task.userId !== userId) throw new ApiError(403, "Not your task");
  return task;
}

export async function updateTask(userId: number, id: number, input: UpdateStudyTaskInput) {
  const existing = await assertOwnsTask(userId, id);
  const updated = await prisma.studyTask.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.dueAt !== undefined ? { dueAt: input.dueAt } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.isDone !== undefined ? { isDone: input.isDone } : {}),
    },
  });

  if (input.isDone === true && !existing.isDone) {
    await gamificationService.awardActivity(userId, XP_RULES.STUDY_TASK_DONE);
  }

  return updated;
}

export async function deleteTask(userId: number, id: number) {
  await assertOwnsTask(userId, id);
  await prisma.studyTask.delete({ where: { id } });
}
