import type { Difficulty, Question } from "../questionBank/types";

export interface QuestionSet {
  id: number;
  chapterId: number | null;
  subjectId: number | null;
  title: string;
  difficulty: Difficulty;
  negativeMarking: string;
  estimatedMinutes: number;
  isPublished: boolean;
  createdAt: string;
  _count?: { items: number };
  chapter?: { id: number; title: string; orderIndex: number } | null;
  subject?: { id: number; title: string; orderIndex: number } | null;
}

export interface QuestionSetItem {
  id: number;
  questionId: number;
  orderIndex: number;
  question: Question;
}

export interface QuestionSetDetail extends QuestionSet {
  items: QuestionSetItem[];
}

export interface QuestionSetSummary {
  id: number;
  title: string;
  difficulty: Difficulty;
  negativeMarking: string;
  estimatedMinutes: number;
  questionCount: number;
  totalMarks: number;
  attempts: number;
  averageScore: number | null;
  bestScore: number | null;
}

export interface CreateQuestionSetInput {
  title: string;
  chapterId?: number;
  subjectId?: number;
  difficulty?: Difficulty;
  negativeMarking?: number;
  estimatedMinutes?: number;
  isPublished?: boolean;
}
