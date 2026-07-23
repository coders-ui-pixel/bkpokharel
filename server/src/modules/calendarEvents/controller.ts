import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as calendarEventService from "./service";
import * as enrollmentService from "../enrollments/service";
import { createCalendarEventSchema, updateCalendarEventSchema } from "./schema";

export async function listForRange(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");

  const rangeStart = req.query.from ? new Date(String(req.query.from)) : new Date();
  const rangeEnd = req.query.to ? new Date(String(req.query.to)) : new Date();
  if (Number.isNaN(rangeStart.getTime()) || Number.isNaN(rangeEnd.getTime())) {
    throw new ApiError(400, "Invalid from/to date range");
  }

  let visibleCourseIds: number[] | "all" = "all";
  if (req.user.role !== "admin") {
    visibleCourseIds = await enrollmentService.listApprovedCourseIdsForUser(req.user.id);
  }

  const occurrences = await calendarEventService.listForRange(rangeStart, rangeEnd, visibleCourseIds);
  res.json({ events: occurrences });
}

export async function listAll(_req: Request, res: Response) {
  const events = await calendarEventService.listAllForAdmin();
  res.json({ events });
}

export async function create(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const input = createCalendarEventSchema.parse(req.body);
  const event = await calendarEventService.create(input, req.user.id);
  res.status(201).json({ event });
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const input = updateCalendarEventSchema.parse(req.body);
  const event = await calendarEventService.update(id, input);
  res.json({ event });
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  await calendarEventService.remove(id);
  res.status(204).send();
}
