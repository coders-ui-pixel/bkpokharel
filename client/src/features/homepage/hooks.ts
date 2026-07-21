import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as homepageApi from "./api";
import type { HeroImagePlacement } from "./types";

export function useHeroImages(placement: HeroImagePlacement = "public_home") {
  return useQuery({
    queryKey: ["homepage", "hero-images", placement],
    queryFn: () => homepageApi.fetchHeroImages(placement),
  });
}

export function useAllHeroImages(placement: HeroImagePlacement = "public_home") {
  return useQuery({
    queryKey: ["homepage", "hero-images", "all", placement],
    queryFn: () => homepageApi.fetchAllHeroImages(placement),
  });
}

function useInvalidateHeroImages() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["homepage", "hero-images"] });
  };
}

export function useCreateHeroImage() {
  const invalidate = useInvalidateHeroImages();
  return useMutation({
    mutationFn: ({
      file,
      title,
      placement,
    }: {
      file: File;
      title: string;
      placement?: HeroImagePlacement;
    }) => homepageApi.createHeroImage(file, title, placement),
    onSuccess: invalidate,
  });
}

export function useUpdateHeroImage() {
  const invalidate = useInvalidateHeroImages();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: { title?: string; isEnabled?: boolean } }) =>
      homepageApi.updateHeroImage(id, input),
    onSuccess: invalidate,
  });
}

export function useReplaceHeroImage() {
  const invalidate = useInvalidateHeroImages();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      homepageApi.replaceHeroImage(id, file),
    onSuccess: invalidate,
  });
}

export function useDeleteHeroImage() {
  const invalidate = useInvalidateHeroImages();
  return useMutation({
    mutationFn: (id: number) => homepageApi.deleteHeroImage(id),
    onSuccess: invalidate,
  });
}

export function useReorderHeroImages() {
  const invalidate = useInvalidateHeroImages();
  return useMutation({
    mutationFn: (orderedIds: number[]) => homepageApi.reorderHeroImages(orderedIds),
    onSuccess: invalidate,
  });
}
