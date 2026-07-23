import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { deleteUploadedFile, publicPathFor } from "../../middleware/upload";
import type { HeroImagePlacement } from "../../config/enums";
import { CreateHeroImageInput, ReorderHeroImagesInput, UpdateHeroImageInput } from "./schema";

export async function listPublicHeroImages(placement: HeroImagePlacement = "public_home") {
  const images = await db
    .selectFrom("heroImages")
    .selectAll()
    .where("isEnabled", "=", true)
    .where("placement", "=", placement)
    .orderBy("orderIndex", "asc")
    .execute();

  return images.map((img) => ({ id: img.id, image: img.imagePath, title: img.title }));
}

export async function listAllHeroImages(placement: HeroImagePlacement = "public_home") {
  return db
    .selectFrom("heroImages")
    .selectAll()
    .where("placement", "=", placement)
    .orderBy("orderIndex", "asc")
    .execute();
}

export async function createHeroImage(input: CreateHeroImageInput, filename: string) {
  const placement = input.placement ?? "public_home";
  const last = await db
    .selectFrom("heroImages")
    .select("orderIndex")
    .where("placement", "=", placement)
    .orderBy("orderIndex", "desc")
    .executeTakeFirst();
  const orderIndex = (last?.orderIndex ?? -1) + 1;

  const result = await db
    .insertInto("heroImages")
    .values({
      title: input.title,
      imagePath: publicPathFor("hero", filename),
      placement,
      orderIndex,
      updatedAt: new Date(),
    })
    .executeTakeFirstOrThrow();
  return db
    .selectFrom("heroImages")
    .selectAll()
    .where("id", "=", Number(result.insertId))
    .executeTakeFirstOrThrow();
}

export async function updateHeroImage(id: number, input: UpdateHeroImageInput) {
  const existing = await db.selectFrom("heroImages").select("id").where("id", "=", id).executeTakeFirst();
  if (!existing) {
    throw new ApiError(404, "Hero image not found");
  }

  await db
    .updateTable("heroImages")
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.isEnabled !== undefined ? { isEnabled: input.isEnabled } : {}),
      updatedAt: new Date(),
    })
    .where("id", "=", id)
    .execute();
  return db.selectFrom("heroImages").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}

export async function replaceHeroImage(id: number, filename: string) {
  const existing = await db.selectFrom("heroImages").selectAll().where("id", "=", id).executeTakeFirst();
  if (!existing) {
    throw new ApiError(404, "Hero image not found");
  }

  deleteUploadedFile(existing.imagePath);

  await db
    .updateTable("heroImages")
    .set({ imagePath: publicPathFor("hero", filename), updatedAt: new Date() })
    .where("id", "=", id)
    .execute();
  return db.selectFrom("heroImages").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}

export async function deleteHeroImage(id: number) {
  const existing = await db.selectFrom("heroImages").selectAll().where("id", "=", id).executeTakeFirst();
  if (!existing) {
    throw new ApiError(404, "Hero image not found");
  }

  deleteUploadedFile(existing.imagePath);
  await db.deleteFrom("heroImages").where("id", "=", id).execute();
}

export async function reorderHeroImages(input: ReorderHeroImagesInput) {
  await db.transaction().execute(async (trx) => {
    for (const [index, id] of input.orderedIds.entries()) {
      await trx.updateTable("heroImages").set({ orderIndex: index, updatedAt: new Date() }).where("id", "=", id).execute();
    }
  });
  return listAllHeroImages();
}
