import { apiClient } from "../../lib/apiClient";
import type { AdminHeroImage, HeroImage, HeroImagePlacement } from "./types";

export async function fetchHeroImages(placement: HeroImagePlacement = "public_home"): Promise<HeroImage[]> {
  const { data } = await apiClient.get<{ images: HeroImage[] }>("/homepage/hero-images", {
    params: { placement },
  });
  return data.images;
}

export async function fetchAllHeroImages(
  placement: HeroImagePlacement = "public_home"
): Promise<AdminHeroImage[]> {
  const { data } = await apiClient.get<{ images: AdminHeroImage[] }>("/homepage/hero-images/all", {
    params: { placement },
  });
  return data.images;
}

export async function createHeroImage(
  file: File,
  title: string,
  placement: HeroImagePlacement = "public_home"
): Promise<AdminHeroImage> {
  const form = new FormData();
  form.append("image", file);
  form.append("title", title);
  form.append("placement", placement);
  const { data } = await apiClient.post<{ image: AdminHeroImage }>("/homepage/hero-images", form);
  return data.image;
}

export async function updateHeroImage(
  id: number,
  input: { title?: string; isEnabled?: boolean }
): Promise<AdminHeroImage> {
  const { data } = await apiClient.put<{ image: AdminHeroImage }>(
    `/homepage/hero-images/${id}`,
    input
  );
  return data.image;
}

export async function replaceHeroImage(id: number, file: File): Promise<AdminHeroImage> {
  const form = new FormData();
  form.append("image", file);
  const { data } = await apiClient.put<{ image: AdminHeroImage }>(
    `/homepage/hero-images/${id}/replace`,
    form
  );
  return data.image;
}

export async function deleteHeroImage(id: number): Promise<void> {
  await apiClient.delete(`/homepage/hero-images/${id}`);
}

export async function reorderHeroImages(orderedIds: number[]): Promise<AdminHeroImage[]> {
  const { data } = await apiClient.put<{ images: AdminHeroImage[] }>(
    "/homepage/hero-images/reorder",
    { orderedIds }
  );
  return data.images;
}
