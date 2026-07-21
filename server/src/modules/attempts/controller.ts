import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as attemptService from "./service";
import { startPracticeSchema, submitPracticeSchema } from "./schema";

export async function startPractice(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const { questionSetId } = startPracticeSchema.parse(req.body);
  const result = await attemptService.startPractice(req.user.id, questionSetId);
  res.status(201).json(result);
}

export async function submitPractice(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const attemptId = Number(req.params.attemptId);
  const input = submitPracticeSchema.parse(req.body);
  const result = await attemptService.submitPractice(req.user.id, attemptId, input);
  res.json({ result });
}

export async function getAttempt(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const id = Number(req.params.id);
  const result = await attemptService.getAttemptDetail(req.user.id, id);
  res.json({ result });
}

export async function listMine(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const attempts = await attemptService.listMyAttempts(req.user.id);
  res.json({ attempts });
}
