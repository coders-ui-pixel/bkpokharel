import type { CorrectOption } from "../questionBank/types";

export interface PracticeQuestion {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  marks: string;
}

export interface PracticeAttempt {
  id: number;
  userId: number;
  questionSetId: number;
  status: "in_progress" | "submitted";
  score: string | null;
  totalMarks: string;
  startedAt: string;
  submittedAt: string | null;
}

export interface StartPracticeResult {
  attempt: PracticeAttempt;
  questions: PracticeQuestion[];
  negativeMarking: string;
}

export interface AnswerInput {
  questionId: number;
  selectedOption: CorrectOption | null;
}

export interface AttemptAnswerReview {
  questionId: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: CorrectOption;
  selectedOption: CorrectOption | null;
  isCorrect: boolean | null;
  marksAwarded: string;
  explanation: string | null;
}

export interface AttemptResult {
  id: number;
  questionSetId: number;
  questionSetTitle: string;
  status: "in_progress" | "submitted";
  score: string;
  totalMarks: string;
  startedAt: string;
  submittedAt: string;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  answers: AttemptAnswerReview[];
}

export interface AttemptListItem {
  id: number;
  questionSetId: number;
  status: "in_progress" | "submitted";
  score: string | null;
  totalMarks: string;
  startedAt: string;
  submittedAt: string | null;
  questionSet: { title: string };
}
