import { db } from "../../config/db";

export async function getOverview() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

  const [
    totalStudentsRow,
    activeStudents7dRow,
    activeStudents30dRow,
    practiceAttempts,
    liveExamAttempts,
    revenueRows,
  ] = await Promise.all([
    db.selectFrom("users").select((eb) => eb.fn.countAll().as("count")).where("role", "=", "user").executeTakeFirstOrThrow(),
    db
      .selectFrom("gamificationProfiles")
      .select((eb) => eb.fn.countAll().as("count"))
      .where("lastActivityDate", ">=", sevenDaysAgo)
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("gamificationProfiles")
      .select((eb) => eb.fn.countAll().as("count"))
      .where("lastActivityDate", ">=", thirtyDaysAgo)
      .executeTakeFirstOrThrow(),
    db.selectFrom("practiceAttempts").select(["score", "totalMarks"]).where("status", "=", "submitted").execute(),
    db.selectFrom("liveExamAttempts").select(["score", "totalMarks"]).where("status", "=", "submitted").execute(),
    db
      .selectFrom("enrollments")
      .innerJoin("courses", "courses.id", "enrollments.courseId")
      .select(["courses.price as price"])
      .where("enrollments.status", "=", "approved")
      .where("courses.isPaid", "=", true)
      .execute(),
  ]);

  const totalStudents = Number(totalStudentsRow.count);
  const activeStudents7d = Number(activeStudents7dRow.count);
  const activeStudents30d = Number(activeStudents30dRow.count);

  const allAttempts = [...practiceAttempts, ...liveExamAttempts];
  const avgScorePercent = allAttempts.length
    ? (allAttempts.reduce((sum, a) => sum + Number(a.score ?? 0) / Number(a.totalMarks), 0) /
        allAttempts.length) *
      100
    : 0;

  const estimatedRevenue = revenueRows.reduce((sum, e) => sum + Number(e.price ?? 0), 0);

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
    db
      .selectFrom("attemptAnswers")
      .innerJoin("questions", "questions.id", "attemptAnswers.questionId")
      .innerJoin("chapters", "chapters.id", "questions.chapterId")
      .innerJoin("subjects", "subjects.id", "chapters.subjectId")
      .select([
        "attemptAnswers.isCorrect as isCorrect",
        "questions.chapterId as chapterId",
        "chapters.title as chapterTitle",
        "subjects.title as subjectTitle",
      ])
      .where("attemptAnswers.selectedOption", "is not", null)
      .execute(),
    db
      .selectFrom("liveExamAnswers")
      .innerJoin("questions", "questions.id", "liveExamAnswers.questionId")
      .innerJoin("chapters", "chapters.id", "questions.chapterId")
      .innerJoin("subjects", "subjects.id", "chapters.subjectId")
      .select([
        "liveExamAnswers.isCorrect as isCorrect",
        "questions.chapterId as chapterId",
        "chapters.title as chapterTitle",
        "subjects.title as subjectTitle",
      ])
      .where("liveExamAnswers.selectedOption", "is not", null)
      .execute(),
  ]);

  const stats = new Map<number, { title: string; subject: string; correct: number; total: number }>();

  for (const a of [...practiceAnswers, ...liveAnswers]) {
    if (a.chapterId === null) continue;
    const entry = stats.get(a.chapterId) ?? {
      title: a.chapterTitle,
      subject: a.subjectTitle,
      correct: 0,
      total: 0,
    };
    entry.total += 1;
    if (a.isCorrect) entry.correct += 1;
    stats.set(a.chapterId, entry);
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
  const rows = await db
    .selectFrom("refreshTokens")
    .select(["deviceType", (eb) => eb.fn.countAll().as("count")])
    .groupBy("deviceType")
    .execute();
  return rows.map((r) => ({ deviceType: r.deviceType ?? "unknown", count: Number(r.count) }));
}
