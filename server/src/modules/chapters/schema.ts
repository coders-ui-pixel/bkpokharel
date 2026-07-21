import { z } from "zod";

export const createChapterSchema = z.object({
  title: z.string().min(1).max(200),
  orderIndex: z.number().int().min(0).optional(),
});

export const updateChapterSchema = createChapterSchema.partial();

export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;
