import { z } from "zod";

export const createSubjectSchema = z.object({
  title: z.string().min(1).max(200),
  orderIndex: z.number().int().min(0).optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const createStandaloneSubjectSchema = z.object({
  title: z.string().min(1).max(200),
  orderIndex: z.number().int().min(0).optional(),
  courseId: z.number().int().positive().nullable().optional(),
});

export const assignSubjectSchema = z.object({
  courseId: z.number().int().positive().nullable(),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type CreateStandaloneSubjectInput = z.infer<typeof createStandaloneSubjectSchema>;
export type AssignSubjectInput = z.infer<typeof assignSubjectSchema>;
