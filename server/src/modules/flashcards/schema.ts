import { z } from "zod";

export const createFlashCardSchema = z.object({
  front: z.string().min(1).max(2000),
  back: z.string().min(1).max(2000),
});

export const updateProgressSchema = z.object({
  status: z.enum(["new", "known", "difficult"]).optional(),
  isFavorite: z.boolean().optional(),
  incrementReview: z.boolean().optional(),
});

export type CreateFlashCardInput = z.infer<typeof createFlashCardSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
