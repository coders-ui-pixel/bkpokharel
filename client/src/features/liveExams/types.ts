export type LiveExamStatus = "scheduled" | "live" | "completed" | "cancelled";

export interface LiveExam {
  id: number;
  title: string;
  questionSetId: number;
  courseId: number | null;
  startsAt: string;
  endsAt: string;
  status: LiveExamStatus;
  questionSet: { title: string; _count?: { items: number } };
  course: { title: string } | null;
}

export interface LiveExamDetail extends LiveExam {
  totalMarks: number;
  questionSet: {
    title: string;
    negativeMarking: string;
    estimatedMinutes: number;
    _count?: { items: number };
  };
}

export interface CreateLiveExamInput {
  title: string;
  questionSetId: number;
  courseId?: number;
  startsAt: string;
  endsAt: string;
}
