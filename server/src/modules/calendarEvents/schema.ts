import { z } from "zod";

export const createCalendarEventSchema = z
  .object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    type: z.enum(["class", "exam", "holiday", "other"]).default("other"),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    isRecurring: z.boolean().default(false),
    recurrenceFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
    recurrenceEndDate: z.coerce.date().optional(),
    courseId: z.number().int().positive().optional(),
  })
  .refine((data) => !data.isRecurring || !!data.recurrenceFrequency, {
    message: "recurrenceFrequency is required when isRecurring is true",
    path: ["recurrenceFrequency"],
  })
  .refine((data) => !data.isRecurring || !!data.recurrenceEndDate, {
    message: "recurrenceEndDate is required when isRecurring is true",
    path: ["recurrenceEndDate"],
  });

export const updateCalendarEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  type: z.enum(["class", "exam", "holiday", "other"]).optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  recurrenceEndDate: z.coerce.date().optional(),
  courseId: z.number().int().positive().nullable().optional(),
});

export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;
export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>;
