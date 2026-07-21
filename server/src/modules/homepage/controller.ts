import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as homepageService from "./service";
import {
  createHeroImageSchema,
  heroImagePlacementSchema,
  reorderHeroImagesSchema,
  updateHeroImageSchema,
} from "./schema";

export async function listPublic(req: Request, res: Response) {
  const placement = heroImagePlacementSchema.optional().parse(req.query.placement) ?? "public_home";
  const images = await homepageService.listPublicHeroImages(placement);
  res.json({ images });
}

export async function listAll(req: Request, res: Response) {
  const placement = heroImagePlacementSchema.optional().parse(req.query.placement) ?? "public_home";
  const images = await homepageService.listAllHeroImages(placement);
  res.json({ images });
}

export async function create(req: Request, res: Response) {
  if (!req.file) throw new ApiError(400, "An image file is required");
  const input = createHeroImageSchema.parse(req.body);
  const image = await homepageService.createHeroImage(input, req.file.filename);
  res.status(201).json({ image });
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const input = updateHeroImageSchema.parse(req.body);
  const image = await homepageService.updateHeroImage(id, input);
  res.json({ image });
}

export async function replace(req: Request, res: Response) {
  if (!req.file) throw new ApiError(400, "An image file is required");
  const id = Number(req.params.id);
  const image = await homepageService.replaceHeroImage(id, req.file.filename);
  res.json({ image });
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  await homepageService.deleteHeroImage(id);
  res.status(204).send();
}

export async function reorder(req: Request, res: Response) {
  const input = reorderHeroImagesSchema.parse(req.body);
  const images = await homepageService.reorderHeroImages(input);
  res.json({ images });
}
