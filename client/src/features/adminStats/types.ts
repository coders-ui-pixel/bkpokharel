export interface ContactMessageSummary {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface RecentEnrollment {
  id: number;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  user: { name: string; email: string };
  course: { title: string };
}

export interface AdminStatsOverview {
  totalStudents: number;
  totalCourses: number;
  publishedCourses: number;
  approvedEnrollments: number;
  pendingEnrollments: number;
  rejectedEnrollments: number;
  totalQuestions: number;
  totalQuestionSets: number;
  contactMessages: number;
  recentContactMessages: ContactMessageSummary[];
  recentEnrollments: RecentEnrollment[];
}
