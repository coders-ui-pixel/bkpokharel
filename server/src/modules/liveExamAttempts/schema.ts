import { z } from "zod";

export const saveAnswerSchema = z.object({
  questionId: z.number().int().positive(),
  selectedOption: z.enum(["A", "B", "C", "D"]).nullable().optional(),
  markedForReview: z.boolean().optional(),
});

export const submitLiveExamSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.number().int().positive(),
        selectedOption: z.enum(["A", "B", "C", "D"]).nullable(),
      })
    )
    .optional(),
});

export type SaveAnswerInput = z.infer<typeof saveAnswerSchema>;
export type SubmitLiveExamInput = z.infer<typeof submitLiveExamSchema>;
