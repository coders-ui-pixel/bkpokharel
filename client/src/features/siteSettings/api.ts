import { apiClient } from "../../lib/apiClient";
import type { SiteSettings, UpdateSiteSettingsInput } from "./types";

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data } = await apiClient.get<{ settings: SiteSettings }>("/site-settings");
  return data.settings;
}

export async function updateSiteSettings(input: UpdateSiteSettingsInput): Promise<SiteSettings> {
  const { data } = await apiClient.put<{ settings: SiteSettings }>("/site-settings", input);
  return data.settings;
}

export async function uploadLogo(file: File): Promise<SiteSettings> {
  const form = new FormData();
  form.append("image", file);
  const { data } = await apiClient.post<{ settings: SiteSettings }>("/site-settings/logo", form);
  return data.settings;
}

export async function uploadFavicon(file: File): Promise<SiteSettings> {
  const form = new FormData();
  form.append("image", file);
  const { data } = await apiClient.post<{ settings: SiteSettings }>(
    "/site-settings/favicon",
    form
  );
  return data.settings;
}
