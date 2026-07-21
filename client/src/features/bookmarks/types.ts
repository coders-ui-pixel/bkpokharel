export type BookmarkContentType = "note" | "important_question";

export interface Bookmark {
  id: number;
  contentType: BookmarkContentType;
  contentId: number;
  createdAt: string;
  note?: { id: number; title: string; filePath: string; chapterId: number };
  importantQuestion?: {
    id: number;
    title: string;
    filePath: string;
    mimeType: string;
    chapterId: number;
  };
}
