import { useBookmarks, useToggleBookmark } from "../../features/bookmarks/hooks";
import type { BookmarkContentType } from "../../features/bookmarks/types";

export function BookmarkButton({
  contentType,
  contentId,
}: {
  contentType: BookmarkContentType;
  contentId: number;
}) {
  const { data: bookmarks } = useBookmarks();
  const toggle = useToggleBookmark();

  const isBookmarked = bookmarks?.some(
    (b) => b.contentType === contentType && b.contentId === contentId
  );

  return (
    <button
      type="button"
      className="bookmark-star-btn"
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      aria-pressed={isBookmarked}
      onClick={(e) => {
        e.stopPropagation();
        toggle.mutate({ contentType, contentId });
      }}
      disabled={toggle.isPending}
    >
      {isBookmarked ? "★" : "☆"}
    </button>
  );
}
