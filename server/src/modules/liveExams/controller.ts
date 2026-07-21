import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as liveExamService from "./service";
import { createLiveExamSchema, updateLiveExamSchema } from "./schema";

export async function list(_req: Request, res: Response) {
  const exams = await liveExamService.listLiveExams();
  res.json({ liveExams: exams });
}

export async function getOne(req: Request, res: Response) {
  const id = Number(req.params.id);
  const exam = await liveExamService.getLiveExam(id);
  res.json({ liveExam: exam });
}

export async function create(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const input = createLiveExamSchema.parse(req.body);
  const exam = await liveExamService.createLiveExam(input, req.user.id);
  res.status(201).json({ liveExam: exam });
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const input = updateLiveExamSchema.parse(req.body);
  const exam = await liveExamService.updateLiveExam(id, input);
  res.json({ liveExam: exam });
}

export async function cancel(req: Request, res: Response) {
  const id = Number(req.params.id);
  await liveExamService.cancelLiveExam(id);
  res.status(204).send();
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  await liveExamService.deleteLiveExam(id);
  res.status(204).send();
}
