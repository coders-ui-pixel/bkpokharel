import { z } from "zod";

export const createStudyTaskSchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(2000).optional(),
  dueAt: z.coerce.date(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export const updateStudyTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  notes: z.string().max(2000).optional().nullable(),
  dueAt: z.coerce.date().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  isDone: z.boolean().optional(),
});

export type CreateStudyTaskInput = z.infer<typeof createStudyTaskSchema>;
export type UpdateStudyTaskInput = z.infer<typeof updateStudyTaskSchema>;
