import { z } from "zod";

export const requestEnrollmentSchema = z.object({
  courseId: z.coerce.number().int().positive(),
  phone: z.string().min(6).max(30),
  couponCode: z.string().min(1).max(40).optional(),
});

export const reviewEnrollmentSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
});

export type RequestEnrollmentInput = z.infer<typeof requestEnrollmentSchema>;
export type ReviewEnrollmentInput = z.infer<typeof reviewEnrollmentSchema>;
