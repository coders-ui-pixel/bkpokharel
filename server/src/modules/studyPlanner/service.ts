import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import * as gamificationService from "../gamification/service";
import { XP_RULES } from "../gamification/badges";
import { CreateStudyTaskInput, UpdateStudyTaskInput } from "./schema";

export async function listForUser(userId: number) {
  return db
    .selectFrom("studyTasks")
    .selectAll()
    .where("userId", "=", userId)
    .orderBy("dueAt", "asc")
    .execute();
}

export async function createTask(userId: number, input: CreateStudyTaskInput) {
  const result = await db
    .insertInto("studyTasks")
    .values({
      userId,
      title: input.title,
      notes: input.notes,
      dueAt: input.dueAt,
      priority: input.priority,
      updatedAt: new Date(),
    })
    .executeTakeFirstOrThrow();
  return db
    .selectFrom("studyTasks")
    .selectAll()
    .where("id", "=", Number(result.insertId))
    .executeTakeFirstOrThrow();
}

async function assertOwnsTask(userId: number, id: number) {
  const task = await db.selectFrom("studyTasks").selectAll().where("id", "=", id).executeTakeFirst();
  if (!task) throw new ApiError(404, "Task not found");
  if (task.userId !== userId) throw new ApiError(403, "Not your task");
  return task;
}

export async function updateTask(userId: number, id: number, input: UpdateStudyTaskInput) {
  const existing = await assertOwnsTask(userId, id);
  await db
    .updateTable("studyTasks")
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.dueAt !== undefined ? { dueAt: input.dueAt } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.isDone !== undefined ? { isDone: input.isDone } : {}),
      updatedAt: new Date(),
    })
    .where("id", "=", id)
    .execute();
  const updated = await db.selectFrom("studyTasks").selectAll().where("id", "=", id).executeTakeFirstOrThrow();

  if (input.isDone === true && !existing.isDone) {
    await gamificationService.awardActivity(userId, XP_RULES.STUDY_TASK_DONE);
  }

  return updated;
}

export async function deleteTask(userId: number, id: number) {
  await assertOwnsTask(userId, id);
  await db.deleteFrom("studyTasks").where("id", "=", id).execute();
}
