import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().min(1).max(200),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
