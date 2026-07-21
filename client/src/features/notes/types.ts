export interface Note {
  id: number;
  chapterId: number;
  title: string;
  filePath: string;
  orderIndex: number;
  createdAt: string;
  bookmarkCount?: number;
}
