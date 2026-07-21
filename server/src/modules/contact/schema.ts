import { z } from "zod";

export const createContactMessageSchema = z.object({
  name: z.string().min(1).max(150),
  email: z.string().email(),
  message: z.string().min(1).max(4000),
});

export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>;
