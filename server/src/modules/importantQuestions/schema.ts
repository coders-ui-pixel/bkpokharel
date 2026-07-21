import { z } from "zod";

export const createImportantQuestionSchema = z.object({
  title: z.string().min(1).max(200),
});

export type CreateImportantQuestionInput = z.infer<typeof createImportantQuestionSchema>;
