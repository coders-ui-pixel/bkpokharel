export interface AnalyticsOverview {
  totalStudents: number;
  activeStudents7d: number;
  activeStudents30d: number;
  retentionRate7d: number;
  retentionRate30d: number;
  totalAttempts: number;
  avgScorePercent: number;
  estimatedRevenue: number;
  paidEnrollmentCount: number;
}

export interface WeakChapter {
  chapterId: number;
  chapterTitle: string;
  subjectTitle: string;
  accuracyPercent: number;
  totalAnswers: number;
}

export interface DeviceBreakdownRow {
  deviceType: string;
  count: number;
}
