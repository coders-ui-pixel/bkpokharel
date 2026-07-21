import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(1).max(5000),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPaid: z.boolean().optional(),
  price: z.number().positive().optional().nullable(),
});

export const updateCourseSchema = createCourseSchema.partial();

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
