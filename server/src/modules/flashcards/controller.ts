import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as flashcardService from "./service";
import { createFlashCardSchema, updateProgressSchema } from "./schema";

export async function list(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const chapterId = Number(req.params.chapterId);

  if (req.user.role === "admin") {
    const cards = await flashcardService.listForChapterAdmin(chapterId);
    return res.json({ flashCards: cards });
  }

  await flashcardService.assertCanAccessChapter(req.user.id, chapterId);
  const cards = await flashcardService.listForChapter(chapterId, req.user.id);
  res.json({ flashCards: cards });
}

export async function listForCourse(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const courseId = Number(req.params.courseId);
  if (req.user.role !== "admin") {
    await flashcardService.assertCanAccessCourse(req.user.id, courseId);
  }
  const cards = await flashcardService.listForCourse(courseId, req.user.id);
  res.json({ flashCards: cards });
}

export async function create(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const chapterId = Number(req.params.chapterId);
  const input = createFlashCardSchema.parse(req.body);
  const card = await flashcardService.createFlashCard(chapterId, input, req.user.id);
  res.status(201).json({ flashCard: card });
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  await flashcardService.deleteFlashCard(id);
  res.status(204).send();
}

export async function reorder(req: Request, res: Response) {
  const id = Number(req.params.id);
  const direction = req.body.direction === "up" ? "up" : "down";
  await flashcardService.reorderFlashCard(id, direction);
  res.status(204).send();
}

export async function updateProgress(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const flashCardId = Number(req.params.id);
  const input = updateProgressSchema.parse(req.body);
  const progress = await flashcardService.updateProgress(req.user.id, flashCardId, input);
  res.json({ progress });
}
