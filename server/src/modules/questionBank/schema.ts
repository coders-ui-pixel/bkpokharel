import { z } from "zod";

const correctOptionEnum = z.enum(["A", "B", "C", "D"]);
const difficultyEnum = z.enum(["easy", "medium", "hard", "mixed"]);

export const createQuestionSchema = z.object({
  chapterId: z.number().int().positive().optional(),
  subjectId: z.number().int().positive().optional(),
  questionText: z.string().min(1).max(2000),
  optionA: z.string().min(1).max(500),
  optionB: z.string().min(1).max(500),
  optionC: z.string().min(1).max(500),
  optionD: z.string().min(1).max(500),
  correctOption: correctOptionEnum,
  marks: z.number().positive().default(1),
  difficulty: difficultyEnum.optional(),
  tags: z.array(z.string()).optional(),
  explanation: z.string().max(4000).optional(),
});

export const updateQuestionSchema = createQuestionSchema.partial();

// Admin picks subject + chapter + a default marks value in the upload UI, so the
// CSV itself only needs to describe the question content, not where it belongs.
export const csvRowSchema = z.object({
  question_text: z.string().min(1),
  option_a: z.string().min(1),
  option_b: z.string().min(1),
  option_c: z.string().min(1),
  option_d: z.string().min(1),
  correct_option: z
    .string()
    .transform((v) => v.trim().toUpperCase())
    .pipe(correctOptionEnum),
  marks: z.string().optional(),
  difficulty: z
    .string()
    .optional()
    .transform((v) => (v ? v.trim().toLowerCase() : undefined))
    .pipe(difficultyEnum.optional()),
  tags: z.string().optional(),
  explanation: z.string().optional(),
});

export const confirmCsvImportSchema = z.object({
  subjectId: z.number().int().positive(),
  chapterId: z.number().int().positive(),
  rows: z.array(
    z.object({
      questionText: z.string(),
      optionA: z.string(),
      optionB: z.string(),
      optionC: z.string(),
      optionD: z.string(),
      correctOption: correctOptionEnum,
      marks: z.number().positive(),
      difficulty: difficultyEnum.optional(),
      tags: z.array(z.string()).optional(),
      explanation: z.string().optional(),
    })
  ),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type ConfirmCsvImportInput = z.infer<typeof confirmCsvImportSchema>;
