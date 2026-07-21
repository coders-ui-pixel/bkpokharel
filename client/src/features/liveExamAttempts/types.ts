import type { CorrectOption } from "../questionBank/types";

export interface ExamQuestion {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  marks: string;
}

export interface ExistingAnswer {
  questionId: number;
  selectedOption: CorrectOption | null;
  markedForReview: boolean;
}

export interface JoinLiveExamResult {
  alreadySubmitted: boolean;
  attemptId?: number;
  attempt?: { id: number; startedAt: string };
  exam?: { id: number; title: string; startsAt: string; endsAt: string };
  negativeMarking?: string;
  serverNow?: string;
  questions?: ExamQuestion[];
  existingAnswers?: ExistingAnswer[];
}

export interface AnalysisRow {
  label: string;
  correct: number;
  total: number;
}

export interface LiveExamAnswerReview {
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

export interface LiveExamResult {
  id: number;
  examTitle: string;
  status: "in_progress" | "submitted";
  score: string;
  totalMarks: string;
  startedAt: string;
  submittedAt: string;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  rank: number | null;
  totalParticipants: number;
  subjectAnalysis: AnalysisRow[];
  chapterAnalysis: AnalysisRow[];
  difficultyAnalysis: AnalysisRow[];
  answers: LiveExamAnswerReview[];
}

export interface LeaderboardRow {
  rank: number;
  attemptId: number;
  name: string;
  score: string;
  submittedAt: string;
}

export interface CertificateData {
  studentName: string;
  examTitle: string;
  score: string;
  totalMarks: string;
  rank: number | null;
  totalParticipants: number;
  submittedAt: string;
}
