import { z } from "zod";

export const updateSiteSettingsSchema = z.object({
  siteName: z.string().min(1).max(100).optional(),
  themePrimaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  themeSecondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  facebookUrl: z.string().url().optional().nullable(),
  instagramUrl: z.string().url().optional().nullable(),
  tiktokUrl: z.string().url().optional().nullable(),
  youtubeUrl: z.string().url().optional().nullable(),
});

export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;
