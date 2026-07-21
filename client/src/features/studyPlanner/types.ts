export type StudyTaskPriority = "low" | "medium" | "high";

export interface StudyTask {
  id: number;
  userId: number;
  title: string;
  notes: string | null;
  dueAt: string;
  priority: StudyTaskPriority;
  isDone: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudyTaskInput {
  title: string;
  notes?: string;
  dueAt: string;
  priority?: StudyTaskPriority;
}

export interface UpdateStudyTaskInput {
  title?: string;
  notes?: string | null;
  dueAt?: string;
  priority?: StudyTaskPriority;
  isDone?: boolean;
}
