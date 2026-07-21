import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as siteSettingsApi from "./api";
import type { UpdateSiteSettingsInput } from "./types";

const QUERY_KEY = ["site-settings"];

export function useSiteSettings() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: siteSettingsApi.fetchSiteSettings });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSiteSettingsInput) => siteSettingsApi.updateSiteSettings(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => siteSettingsApi.uploadLogo(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUploadFavicon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => siteSettingsApi.uploadFavicon(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
