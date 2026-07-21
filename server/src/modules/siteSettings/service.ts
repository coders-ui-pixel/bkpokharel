import { prisma } from "../../config/db";
import { UpdateSiteSettingsInput } from "./schema";

export async function getSettings() {
  const existing = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.siteSettings.create({ data: { id: 1 } });
}

export async function updateSettings(input: UpdateSiteSettingsInput) {
  await getSettings();
  return prisma.siteSettings.update({
    where: { id: 1 },
    data: {
      ...(input.siteName !== undefined ? { siteName: input.siteName } : {}),
      ...(input.themePrimaryColor !== undefined ? { themePrimaryColor: input.themePrimaryColor } : {}),
      ...(input.themeSecondaryColor !== undefined
        ? { themeSecondaryColor: input.themeSecondaryColor }
        : {}),
      ...(input.facebookUrl !== undefined ? { facebookUrl: input.facebookUrl } : {}),
      ...(input.instagramUrl !== undefined ? { instagramUrl: input.instagramUrl } : {}),
      ...(input.tiktokUrl !== undefined ? { tiktokUrl: input.tiktokUrl } : {}),
      ...(input.youtubeUrl !== undefined ? { youtubeUrl: input.youtubeUrl } : {}),
    },
  });
}

export async function setLogo(filename: string) {
  await getSettings();
  return prisma.siteSettings.update({
    where: { id: 1 },
    data: { logoImagePath: `/uploads/branding/${filename}` },
  });
}

export async function setFavicon(filename: string) {
  await getSettings();
  return prisma.siteSettings.update({
    where: { id: 1 },
    data: { faviconImagePath: `/uploads/branding/${filename}` },
  });
}
