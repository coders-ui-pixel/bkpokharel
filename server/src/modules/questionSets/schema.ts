import { z } from "zod";

export const createQuestionSetSchema = z.object({
  title: z.string().min(1).max(200),
  chapterId: z.number().int().positive().optional(),
  subjectId: z.number().int().positive().optional(),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]).default("mixed"),
  negativeMarking: z.number().min(0).max(1).default(0),
  estimatedMinutes: z.number().int().positive().default(30),
  isPublished: z.boolean().optional(),
});

export const updateQuestionSetSchema = createQuestionSetSchema.partial();

export const setItemsSchema = z.object({
  questionIds: z.array(z.number().int().positive()),
});

export type CreateQuestionSetInput = z.infer<typeof createQuestionSetSchema>;
export type UpdateQuestionSetInput = z.infer<typeof updateQuestionSetSchema>;
export type SetItemsInput = z.infer<typeof setItemsSchema>;
