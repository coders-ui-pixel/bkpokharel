import { z } from "zod";

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(40)
    .transform((v) => v.trim().toUpperCase()),
  name: z.string().min(1).max(120),
  discountPercent: z.number().int().min(1).max(100),
  maxUses: z.number().int().min(1).nullable().optional(),
  courseIds: z.array(z.number().int().positive()).min(1),
});

export const updateCouponSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  discountPercent: z.number().int().min(1).max(100).optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  isActive: z.boolean().optional(),
  courseIds: z.array(z.number().int().positive()).min(1).optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1).max(40),
  courseId: z.coerce.number().int().positive(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
