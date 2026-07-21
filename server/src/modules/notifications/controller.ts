import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as notificationService from "./service";
import { sendNotificationSchema } from "./schema";

export async function list(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const result = await notificationService.listForUser(req.user.id);
  res.json(result);
}

export async function markRead(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const id = Number(req.params.id);
  const notification = await notificationService.markRead(req.user.id, id);
  res.json({ notification });
}

export async function markAllRead(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  await notificationService.markAllRead(req.user.id);
  res.status(204).send();
}

export async function sendFromAdmin(req: Request, res: Response) {
  const input = sendNotificationSchema.parse(req.body);
  const result = await notificationService.sendFromAdmin(input);
  res.status(201).json(result);
}
