import { z } from "zod";

export const createLiveExamSchema = z.object({
  title: z.string().min(1).max(200),
  questionSetId: z.number().int().positive(),
  courseId: z.number().int().positive().optional(),
  startsAt: z.string().datetime().or(z.string().min(1)),
  endsAt: z.string().datetime().or(z.string().min(1)),
});

export const updateLiveExamSchema = createLiveExamSchema.partial();

export type CreateLiveExamInput = z.infer<typeof createLiveExamSchema>;
export type UpdateLiveExamInput = z.infer<typeof updateLiveExamSchema>;
