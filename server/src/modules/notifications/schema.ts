import { z } from "zod";

export const sendNotificationSchema = z
  .object({
    title: z.string().min(1).max(200),
    body: z.string().max(2000).optional(),
    type: z.enum(["info", "success", "warning", "error"]).default("info"),
    link: z.string().max(500).optional(),
    userEmail: z.string().email().optional(),
    broadcast: z.boolean().optional(),
  })
  .refine((data) => data.broadcast || !!data.userEmail, {
    message: "Provide userEmail or set broadcast to true",
  });

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
