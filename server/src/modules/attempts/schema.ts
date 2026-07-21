import { z } from "zod";

export const startPracticeSchema = z.object({
  questionSetId: z.number().int().positive(),
});

export const submitPracticeSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.number().int().positive(),
      selectedOption: z.enum(["A", "B", "C", "D"]).nullable(),
    })
  ),
});

export type StartPracticeInput = z.infer<typeof startPracticeSchema>;
export type SubmitPracticeInput = z.infer<typeof submitPracticeSchema>;
