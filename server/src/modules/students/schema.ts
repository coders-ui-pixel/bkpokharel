import { z } from "zod";

export const updateStudentSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().min(6).max(30).optional(),
  college: z.string().min(1).max(200).optional(),
});

export const suspendStudentSchema = z.object({
  isActive: z.boolean(),
});

export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type SuspendStudentInput = z.infer<typeof suspendStudentSchema>;
