import { apiClient } from "../../lib/apiClient";
import type { Bookmark, BookmarkContentType } from "./types";

export async function fetchBookmarks(): Promise<Bookmark[]> {
  const { data } = await apiClient.get<{ bookmarks: Bookmark[] }>("/bookmarks");
  return data.bookmarks;
}

export async function toggleBookmark(
  contentType: BookmarkContentType,
  contentId: number
): Promise<{ bookmarked: boolean }> {
  const { data } = await apiClient.post<{ bookmarked: boolean }>("/bookmarks/toggle", {
    contentType,
    contentId,
  });
  return data;
}
