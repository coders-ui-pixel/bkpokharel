import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as siteSettingsService from "./service";
import { updateSiteSettingsSchema } from "./schema";

export async function get(_req: Request, res: Response) {
  const settings = await siteSettingsService.getSettings();
  res.json({ settings });
}

export async function update(req: Request, res: Response) {
  const input = updateSiteSettingsSchema.parse(req.body);
  const settings = await siteSettingsService.updateSettings(input);
  res.json({ settings });
}

export async function uploadLogo(req: Request, res: Response) {
  if (!req.file) throw new ApiError(400, "An image file is required");
  const settings = await siteSettingsService.setLogo(req.file.filename);
  res.json({ settings });
}

export async function uploadFavicon(req: Request, res: Response) {
  if (!req.file) throw new ApiError(400, "An image file is required");
  const settings = await siteSettingsService.setFavicon(req.file.filename);
  res.json({ settings });
}
