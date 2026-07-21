import { prisma } from "../../config/db";

export async function getOverview() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

  const [
    totalStudents,
    activeStudents7d,
    activeStudents30d,
    practiceAttempts,
    liveExamAttempts,
    revenueRows,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "user" } }),
    prisma.gamificationProfile.count({ where: { lastActivityDate: { gte: sevenDaysAgo } } }),
    prisma.gamificationProfile.count({ where: { lastActivityDate: { gte: thirtyDaysAgo } } }),
    prisma.practiceAttempt.findMany({
      where: { status: "submitted" },
      select: { score: true, totalMarks: true },
    }),
    prisma.liveExamAttempt.findMany({
      where: { status: "submitted" },
      select: { score: true, totalMarks: true },
    }),
    prisma.enrollment.findMany({
      where: { status: "approved", course: { isPaid: true } },
      include: { course: { select: { price: true } } },
    }),
  ]);

  const allAttempts = [...practiceAttempts, ...liveExamAttempts];
  const avgScorePercent = allAttempts.length
    ? (allAttempts.reduce((sum, a) => sum + Number(a.score ?? 0) / Number(a.totalMarks), 0) /
        allAttempts.length) *
      100
    : 0;

  const estimatedRevenue = revenueRows.reduce((sum, e) => sum + Number(e.course.price ?? 0), 0);

  return {
    totalStudents,
    activeStudents7d,
    activeStudents30d,
    retentionRate7d: totalStudents ? (activeStudents7d / totalStudents) * 100 : 0,
    retentionRate30d: totalStudents ? (activeStudents30d / totalStudents) * 100 : 0,
    totalAttempts: allAttempts.length,
    avgScorePercent,
    estimatedRevenue,
    paidEnrollmentCount: revenueRows.length,
  };
}

export async function getWeakChapters(limit = 10) {
  const [practiceAnswers, liveAnswers] = await Promise.all([
    prisma.attemptAnswer.findMany({
      where: { selectedOption: { not: null } },
      select: {
        isCorrect: true,
        question: { select: { chapterId: true, chapter: { select: { title: true, subject: { select: { title: true } } } } } },
      },
    }),
    prisma.liveExamAnswer.findMany({
      where: { selectedOption: { not: null } },
      select: {
        isCorrect: true,
        question: { select: { chapterId: true, chapter: { select: { title: true, subject: { select: { title: true } } } } } },
      },
    }),
  ]);

  const stats = new Map<number, { title: string; subject: string; correct: number; total: number }>();

  for (const a of [...practiceAnswers, ...liveAnswers]) {
    const chapterId = a.question.chapterId;
    if (!chapterId || !a.question.chapter) continue;
    const entry = stats.get(chapterId) ?? {
      title: a.question.chapter.title,
      subject: a.question.chapter.subject.title,
      correct: 0,
      total: 0,
    };
    entry.total += 1;
    if (a.isCorrect) entry.correct += 1;
    stats.set(chapterId, entry);
  }

  return Array.from(stats.entries())
    .map(([chapterId, s]) => ({
      chapterId,
      chapterTitle: s.title,
      subjectTitle: s.subject,
      accuracyPercent: (s.correct / s.total) * 100,
      totalAnswers: s.total,
    }))
    .filter((c) => c.totalAnswers >= 3)
    .sort((a, b) => a.accuracyPercent - b.accuracyPercent)
    .slice(0, limit);
}

export async function getDeviceBreakdown() {
  const rows = await prisma.refreshToken.groupBy({
    by: ["deviceType"],
    _count: { _all: true },
  });
  return rows.map((r) => ({ deviceType: r.deviceType ?? "unknown", count: r._count._all }));
}
