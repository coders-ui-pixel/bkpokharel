export interface StudentListItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  college: string | null;
  isActive: boolean;
  createdAt: string;
  enrollmentCount: number;
  practiceAttemptCount: number;
  liveExamAttemptCount: number;
}

export interface StudentEnrollmentSummary {
  id: number;
  courseId: number;
  courseTitle: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
}

export interface StudentDetail {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  college: string | null;
  isActive: boolean;
  createdAt: string;
  enrollments: StudentEnrollmentSummary[];
  gamification: {
    xp: number;
    coins: number;
    currentStreak: number;
    longestStreak: number;
  } | null;
}

export interface UpdateStudentInput {
  name?: string;
  phone?: string;
  college?: string;
}
