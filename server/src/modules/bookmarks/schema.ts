import { z } from "zod";

export const toggleBookmarkSchema = z.object({
  contentType: z.enum(["note", "important_question"]),
  contentId: z.number().int().positive(),
});

export type ToggleBookmarkInput = z.infer<typeof toggleBookmarkSchema>;
