import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as studyPlannerService from "./service";
import { createStudyTaskSchema, updateStudyTaskSchema } from "./schema";

export async function list(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const tasks = await studyPlannerService.listForUser(req.user.id);
  res.json({ tasks });
}

export async function create(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const input = createStudyTaskSchema.parse(req.body);
  const task = await studyPlannerService.createTask(req.user.id, input);
  res.status(201).json({ task });
}

export async function update(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const id = Number(req.params.id);
  const input = updateStudyTaskSchema.parse(req.body);
  const task = await studyPlannerService.updateTask(req.user.id, id, input);
  res.json({ task });
}

export async function remove(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const id = Number(req.params.id);
  await studyPlannerService.deleteTask(req.user.id, id);
  res.status(204).send();
}
