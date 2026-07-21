export interface Chapter {
  id: number;
  subjectId: number;
  title: string;
  orderIndex: number;
}

export interface Subject {
  id: number;
  courseId: number | null;
  title: string;
  orderIndex: number;
  _count?: { chapters: number };
  chapters?: Chapter[];
  course?: { id: number; title: string } | null;
}

export interface SubjectInput {
  title: string;
  orderIndex?: number;
}

export interface StandaloneSubjectInput {
  title: string;
  orderIndex?: number;
  courseId?: number | null;
}

export interface ChapterInput {
  title: string;
  orderIndex?: number;
}
