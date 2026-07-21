import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as liveExamAttemptService from "./service";
import { saveAnswerSchema, submitLiveExamSchema } from "./schema";

export async function join(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const liveExamId = Number(req.params.id);
  const result = await liveExamAttemptService.joinLiveExam(req.user.id, liveExamId);
  res.status(201).json(result);
}

export async function saveAnswer(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const attemptId = Number(req.params.attemptId);
  const input = saveAnswerSchema.parse(req.body);
  const result = await liveExamAttemptService.saveAnswer(req.user.id, attemptId, input);
  res.json(result);
}

export async function submit(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const attemptId = Number(req.params.attemptId);
  const input = submitLiveExamSchema.parse(req.body);
  const result = await liveExamAttemptService.submitLiveExam(req.user.id, attemptId, input);
  res.json({ result });
}

export async function getResult(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const attemptId = Number(req.params.attemptId);
  const result = await liveExamAttemptService.getAttemptResult(req.user.id, attemptId);
  res.json({ result });
}

export async function leaderboard(req: Request, res: Response) {
  const liveExamId = Number(req.params.id);
  const rows = await liveExamAttemptService.getLeaderboard(liveExamId);
  res.json({ leaderboard: rows });
}

export async function certificate(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const attemptId = Number(req.params.attemptId);
  const data = await liveExamAttemptService.getCertificateData(req.user.id, req.user.role, attemptId);
  res.json({ certificate: data });
}
