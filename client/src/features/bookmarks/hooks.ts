import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as bookmarksApi from "./api";
import type { BookmarkContentType } from "./types";

const KEY = ["bookmarks"];

export function useBookmarks() {
  return useQuery({
    queryKey: KEY,
    queryFn: bookmarksApi.fetchBookmarks,
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contentType, contentId }: { contentType: BookmarkContentType; contentId: number }) =>
      bookmarksApi.toggleBookmark(contentType, contentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
