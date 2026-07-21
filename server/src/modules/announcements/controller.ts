import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as announcementService from "./service";
import * as auditLogService from "../auditLogs/service";
import { createAnnouncementSchema, updateAnnouncementSchema } from "./schema";

export async function listAll(_req: Request, res: Response) {
  const announcements = await announcementService.listAll();
  res.json({ announcements });
}

export async function listActive(_req: Request, res: Response) {
  const announcements = await announcementService.listActive();
  res.json({ announcements });
}

export async function create(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const input = createAnnouncementSchema.parse(req.body);
  const announcement = await announcementService.create(input, req.user.id);
  await auditLogService.log(req.user.id, "announcement.create", "announcement", announcement.id, {
    title: announcement.title,
  });
  res.status(201).json({ announcement });
}

export async function update(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const id = Number(req.params.id);
  const input = updateAnnouncementSchema.parse(req.body);
  const announcement = await announcementService.update(id, input);
  await auditLogService.log(req.user.id, "announcement.update", "announcement", id, input);
  res.json({ announcement });
}

export async function remove(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const id = Number(req.params.id);
  await announcementService.remove(id);
  await auditLogService.log(req.user.id, "announcement.delete", "announcement", id);
  res.status(204).send();
}
