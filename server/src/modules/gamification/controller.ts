import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as gamificationService from "./service";

export async function me(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const profile = await gamificationService.getProfile(req.user.id);
  res.json({ profile });
}

export async function leaderboard(req: Request, res: Response) {
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const entries = await gamificationService.getLeaderboard(limit);
  res.json({ leaderboard: entries });
}
