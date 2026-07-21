import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as questionSetService from "./service";
import { createQuestionSetSchema, setItemsSchema, updateQuestionSetSchema } from "./schema";

export async function list(req: Request, res: Response) {
  const chapterId = req.query.chapterId ? Number(req.query.chapterId) : undefined;
  const subjectId = req.query.subjectId ? Number(req.query.subjectId) : undefined;
  const courseId = req.query.courseId ? Number(req.query.courseId) : undefined;
  const includeUnpublished = req.user?.role === "admin";
  const sets = await questionSetService.listQuestionSets(
    { chapterId, subjectId, courseId },
    includeUnpublished
  );
  res.json({ questionSets: sets });
}

export async function getForAdmin(req: Request, res: Response) {
  const id = Number(req.params.id);
  const set = await questionSetService.getQuestionSetForAdmin(id);
  res.json({ questionSet: set });
}

export async function getSummary(req: Request, res: Response) {
  const id = Number(req.params.id);
  const summary = await questionSetService.getQuestionSetSummary(id, req.user?.id);
  res.json({ questionSet: summary });
}

export async function create(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const input = createQuestionSetSchema.parse(req.body);
  const set = await questionSetService.createQuestionSet(input, req.user.id);
  res.status(201).json({ questionSet: set });
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const input = updateQuestionSetSchema.parse(req.body);
  const set = await questionSetService.updateQuestionSet(id, input);
  res.json({ questionSet: set });
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  await questionSetService.deleteQuestionSet(id);
  res.status(204).send();
}

export async function setItems(req: Request, res: Response) {
  const id = Number(req.params.id);
  const input = setItemsSchema.parse(req.body);
  const set = await questionSetService.setQuestionSetItems(id, input);
  res.json({ questionSet: set });
}
