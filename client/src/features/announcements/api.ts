import { apiClient } from "../../lib/apiClient";
import type { Announcement, CreateAnnouncementInput, UpdateAnnouncementInput } from "./types";

export async function fetchActiveAnnouncements(): Promise<Announcement[]> {
  const { data } = await apiClient.get<{ announcements: Announcement[] }>("/announcements/active");
  return data.announcements;
}

export async function fetchAllAnnouncements(): Promise<Announcement[]> {
  const { data } = await apiClient.get<{ announcements: Announcement[] }>("/announcements");
  return data.announcements;
}

export async function createAnnouncement(input: CreateAnnouncementInput): Promise<Announcement> {
  const { data } = await apiClient.post<{ announcement: Announcement }>("/announcements", input);
  return data.announcement;
}

export async function updateAnnouncement(
  id: number,
  input: UpdateAnnouncementInput
): Promise<Announcement> {
  const { data } = await apiClient.put<{ announcement: Announcement }>(`/announcements/${id}`, input);
  return data.announcement;
}

export async function deleteAnnouncement(id: number): Promise<void> {
  await apiClient.delete(`/announcements/${id}`);
}
