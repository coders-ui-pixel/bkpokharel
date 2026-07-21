import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as bookmarkService from "./service";
import { toggleBookmarkSchema } from "./schema";

export async function list(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const bookmarks = await bookmarkService.listForUser(req.user.id);
  res.json({ bookmarks });
}

export async function toggle(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const input = toggleBookmarkSchema.parse(req.body);
  const result = await bookmarkService.toggle(req.user.id, input);
  res.json(result);
}
