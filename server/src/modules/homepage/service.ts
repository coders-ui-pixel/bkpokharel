import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { deleteUploadedFile, publicPathFor } from "../../middleware/upload";
import {
  CreateHeroImageInput,
  HeroImagePlacement,
  ReorderHeroImagesInput,
  UpdateHeroImageInput,
} from "./schema";

export async function listPublicHeroImages(placement: HeroImagePlacement = "public_home") {
  const images = await prisma.heroImage.findMany({
    where: { isEnabled: true, placement },
    orderBy: { orderIndex: "asc" },
  });

  return images.map((img) => ({ id: img.id, image: img.imagePath, title: img.title }));
}

export async function listAllHeroImages(placement: HeroImagePlacement = "public_home") {
  return prisma.heroImage.findMany({ where: { placement }, orderBy: { orderIndex: "asc" } });
}

export async function createHeroImage(input: CreateHeroImageInput, filename: string) {
  const placement = input.placement ?? "public_home";
  const last = await prisma.heroImage.findFirst({ where: { placement }, orderBy: { orderIndex: "desc" } });
  const orderIndex = (last?.orderIndex ?? -1) + 1;

  return prisma.heroImage.create({
    data: {
      title: input.title,
      imagePath: publicPathFor("hero", filename),
      placement,
      orderIndex,
    },
  });
}

export async function updateHeroImage(id: number, input: UpdateHeroImageInput) {
  const existing = await prisma.heroImage.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Hero image not found");
  }

  return prisma.heroImage.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.isEnabled !== undefined ? { isEnabled: input.isEnabled } : {}),
    },
  });
}

export async function replaceHeroImage(id: number, filename: string) {
  const existing = await prisma.heroImage.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Hero image not found");
  }

  deleteUploadedFile(existing.imagePath);

  return prisma.heroImage.update({
    where: { id },
    data: { imagePath: publicPathFor("hero", filename) },
  });
}

export async function deleteHeroImage(id: number) {
  const existing = await prisma.heroImage.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Hero image not found");
  }

  deleteUploadedFile(existing.imagePath);
  await prisma.heroImage.delete({ where: { id } });
}

export async function reorderHeroImages(input: ReorderHeroImagesInput) {
  await prisma.$transaction(
    input.orderedIds.map((id, index) =>
      prisma.heroImage.update({ where: { id }, data: { orderIndex: index } })
    )
  );
  return listAllHeroImages();
}
