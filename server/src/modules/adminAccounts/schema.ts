import { z } from "zod";

export const ADMIN_ROLES = ["super_admin", "admin", "instructor", "content_manager", "moderator"] as const;

export const createAdminSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  adminRole: z.enum(ADMIN_ROLES),
});

export const updateAdminRoleSchema = z.object({
  adminRole: z.enum(ADMIN_ROLES),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminRoleInput = z.infer<typeof updateAdminRoleSchema>;
