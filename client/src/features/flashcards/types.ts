export type FlashCardStatus = "new" | "known" | "difficult";

export interface FlashCard {
  id: number;
  chapterId: number;
  front: string;
  back: string;
  status: FlashCardStatus;
  isFavorite: boolean;
  reviewCount: number;
}

export interface UpdateProgressInput {
  status?: FlashCardStatus;
  isFavorite?: boolean;
  incrementReview?: boolean;
}

export interface CourseFlashCard {
  id: number;
  chapterId: number;
  chapterTitle: string;
  subjectId: number;
  subjectTitle: string;
  front: string;
  back: string;
  status: FlashCardStatus;
  isFavorite: boolean;
  reviewCount: number;
}

export interface AdminFlashCard {
  id: number;
  chapterId: number;
  front: string;
  back: string;
  orderIndex: number;
  studentsEngaged: number;
  studentsMastered: number;
}
