import { Request, Response } from "express";
import * as analyticsService from "./service";

export async function overview(_req: Request, res: Response) {
  const data = await analyticsService.getOverview();
  res.json(data);
}

export async function weakChapters(req: Request, res: Response) {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const data = await analyticsService.getWeakChapters(limit);
  res.json({ weakChapters: data });
}

export async function devices(_req: Request, res: Response) {
  const data = await analyticsService.getDeviceBreakdown();
  res.json({ devices: data });
}
