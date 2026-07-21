export interface ImportantQuestionItem {
  id: number;
  chapterId: number;
  title: string;
  filePath: string;
  mimeType: string;
  orderIndex: number;
  createdAt: string;
  bookmarkCount?: number;
}
