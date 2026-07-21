import { z } from "zod";

export const heroImagePlacementSchema = z.enum(["public_home", "dashboard"]);

export const createHeroImageSchema = z.object({
  title: z.string().min(1).max(150),
  placement: heroImagePlacementSchema.optional(),
});

export const updateHeroImageSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  isEnabled: z.boolean().optional(),
});

export const reorderHeroImagesSchema = z.object({
  orderedIds: z.array(z.number().int().positive()).min(1),
});

export type CreateHeroImageInput = z.infer<typeof createHeroImageSchema>;
export type UpdateHeroImageInput = z.infer<typeof updateHeroImageSchema>;
export type ReorderHeroImagesInput = z.infer<typeof reorderHeroImagesSchema>;
export type HeroImagePlacement = z.infer<typeof heroImagePlacementSchema>;
