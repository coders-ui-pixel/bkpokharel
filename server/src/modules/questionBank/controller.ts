import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as questionBankService from "./service";
import { confirmCsvImportSchema, createQuestionSchema, updateQuestionSchema } from "./schema";

export async function list(req: Request, res: Response) {
  const chapterId = req.query.chapterId ? Number(req.query.chapterId) : undefined;
  const subjectId = req.query.subjectId ? Number(req.query.subjectId) : undefined;
  const difficulty = typeof req.query.difficulty === "string" ? req.query.difficulty : undefined;
  const questions = await questionBankService.listQuestions({ chapterId, subjectId, difficulty });
  res.json({ questions });
}

export async function create(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const input = createQuestionSchema.parse(req.body);
  const question = await questionBankService.createQuestion(input, req.user.id);
  res.status(201).json({ question });
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const input = updateQuestionSchema.parse(req.body);
  const question = await questionBankService.updateQuestion(id, input);
  res.json({ question });
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  await questionBankService.deleteQuestion(id);
  res.status(204).send();
}

export async function uploadCsvDryRun(req: Request, res: Response) {
  if (!req.file) throw new ApiError(400, "A CSV file is required");
  const chapterId = Number(req.body.chapterId);
  const defaultMarks = req.body.defaultMarks ? Number(req.body.defaultMarks) : 1;
  if (!chapterId) throw new ApiError(400, "chapterId is required");

  const preview = await questionBankService.dryRunCsvImport(chapterId, defaultMarks, req.file.buffer);
  res.json(preview);
}

export async function uploadCsvConfirm(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const input = confirmCsvImportSchema.parse(req.body);
  const result = await questionBankService.confirmCsvImport(input, req.user.id);
  res.status(201).json(result);
}
