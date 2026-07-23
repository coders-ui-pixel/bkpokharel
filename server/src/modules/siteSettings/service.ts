import { db } from "../../config/db";
import { UpdateSiteSettingsInput } from "./schema";

export async function getSettings() {
  const existing = await db.selectFrom("siteSettings").selectAll().where("id", "=", 1).executeTakeFirst();
  if (existing) return existing;

  await db.insertInto("siteSettings").values({ id: 1, updatedAt: new Date() }).execute();
  return db.selectFrom("siteSettings").selectAll().where("id", "=", 1).executeTakeFirstOrThrow();
}

export async function updateSettings(input: UpdateSiteSettingsInput) {
  await getSettings();
  await db
    .updateTable("siteSettings")
    .set({
      ...(input.siteName !== undefined ? { siteName: input.siteName } : {}),
      ...(input.themePrimaryColor !== undefined ? { themePrimaryColor: input.themePrimaryColor } : {}),
      ...(input.themeSecondaryColor !== undefined
        ? { themeSecondaryColor: input.themeSecondaryColor }
        : {}),
      ...(input.facebookUrl !== undefined ? { facebookUrl: input.facebookUrl } : {}),
      ...(input.instagramUrl !== undefined ? { instagramUrl: input.instagramUrl } : {}),
      ...(input.tiktokUrl !== undefined ? { tiktokUrl: input.tiktokUrl } : {}),
      ...(input.youtubeUrl !== undefined ? { youtubeUrl: input.youtubeUrl } : {}),
      updatedAt: new Date(),
    })
    .where("id", "=", 1)
    .execute();
  return db.selectFrom("siteSettings").selectAll().where("id", "=", 1).executeTakeFirstOrThrow();
}

export async function setLogo(filename: string) {
  await getSettings();
  await db
    .updateTable("siteSettings")
    .set({ logoImagePath: `/uploads/branding/${filename}`, updatedAt: new Date() })
    .where("id", "=", 1)
    .execute();
  return db.selectFrom("siteSettings").selectAll().where("id", "=", 1).executeTakeFirstOrThrow();
}

export async function setFavicon(filename: string) {
  await getSettings();
  await db
    .updateTable("siteSettings")
    .set({ faviconImagePath: `/uploads/branding/${filename}`, updatedAt: new Date() })
    .where("id", "=", 1)
    .execute();
  return db.selectFrom("siteSettings").selectAll().where("id", "=", 1).executeTakeFirstOrThrow();
}
