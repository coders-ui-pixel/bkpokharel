import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import * as gamificationService from "../gamification/service";
import { XP_RULES } from "../gamification/badges";
import { SaveAnswerInput, SubmitLiveExamInput } from "./schema";

const GRACE_MS = 5000;

async function assertEnrolledIfNeeded(userId: number, courseId: number | null) {
  if (!courseId) return;
  const enrollment = await db
    .selectFrom("enrollments")
    .select("status")
    .where("userId", "=", userId)
    .where("courseId", "=", courseId)
    .executeTakeFirst();
  if (!enrollment || enrollment.status !== "approved") {
    throw new ApiError(403, "You must be enrolled in this course to join this live exam");
  }
}

export async function joinLiveExam(userId: number, liveExamId: number) {
  const exam = await db.selectFrom("liveExams").selectAll().where("id", "=", liveExamId).executeTakeFirst();
  if (!exam) throw new ApiError(404, "Live exam not found");
  if (exam.status === "cancelled") throw new ApiError(400, "This live exam has been cancelled");

  const now = new Date();
  if (now < exam.startsAt) throw new ApiError(400, "This exam hasn't started yet");
  if (now > exam.endsAt) throw new ApiError(400, "This exam has already ended");

  await assertEnrolledIfNeeded(userId, exam.courseId);

  const questionSet = await db
    .selectFrom("questionSets")
    .selectAll()
    .where("id", "=", exam.questionSetId)
    .executeTakeFirstOrThrow();

  const items = await db
    .selectFrom("questionSetItems")
    .innerJoin("questions", "questions.id", "questionSetItems.questionId")
    .select([
      "questions.id as id",
      "questions.questionText as questionText",
      "questions.optionA as optionA",
      "questions.optionB as optionB",
      "questions.optionC as optionC",
      "questions.optionD as optionD",
      "questions.marks as marks",
      "questionSetItems.orderIndex as orderIndex",
    ])
    .where("questionSetItems.questionSetId", "=", exam.questionSetId)
    .orderBy("questionSetItems.orderIndex", "asc")
    .execute();
  if (items.length === 0) throw new ApiError(400, "This exam's question set has no questions yet");

  let attempt = await db
    .selectFrom("liveExamAttempts")
    .selectAll()
    .where("userId", "=", userId)
    .where("liveExamId", "=", liveExamId)
    .executeTakeFirst();

  if (attempt?.status === "submitted") {
    return { alreadySubmitted: true, attemptId: attempt.id };
  }

  if (!attempt) {
    const totalMarks = items.reduce((sum, item) => sum + Number(item.marks), 0);
    const result = await db
      .insertInto("liveExamAttempts")
      .values({ userId, liveExamId, totalMarks })
      .executeTakeFirstOrThrow();
    attempt = await db
      .selectFrom("liveExamAttempts")
      .selectAll()
      .where("id", "=", Number(result.insertId))
      .executeTakeFirstOrThrow();
  }

  const existingAnswers = await db
    .selectFrom("liveExamAnswers")
    .select(["questionId", "selectedOption", "markedForReview"])
    .where("attemptId", "=", attempt.id)
    .execute();

  return {
    alreadySubmitted: false,
    attempt: { id: attempt.id, startedAt: attempt.startedAt },
    exam: { id: exam.id, title: exam.title, startsAt: exam.startsAt, endsAt: exam.endsAt },
    negativeMarking: questionSet.negativeMarking,
    serverNow: now,
    questions: items.map((item) => ({
      id: item.id,
      questionText: item.questionText,
      optionA: item.optionA,
      optionB: item.optionB,
      optionC: item.optionC,
      optionD: item.optionD,
      marks: item.marks,
    })),
    existingAnswers: existingAnswers.map((a) => ({
      questionId: a.questionId,
      selectedOption: a.selectedOption,
      markedForReview: a.markedForReview,
    })),
  };
}

async function getOwnedInProgressAttempt(userId: number, attemptId: number) {
  const attempt = await db
    .selectFrom("liveExamAttempts")
    .innerJoin("liveExams", "liveExams.id", "liveExamAttempts.liveExamId")
    .selectAll("liveExamAttempts")
    .select(["liveExams.endsAt as endsAt"])
    .where("liveExamAttempts.id", "=", attemptId)
    .executeTakeFirst();
  if (!attempt || attempt.userId !== userId) throw new ApiError(404, "Attempt not found");
  if (attempt.status !== "in_progress") {
    throw new ApiError(409, "This attempt has already been submitted");
  }
  return attempt;
}

export async function saveAnswer(userId: number, attemptId: number, input: SaveAnswerInput) {
  const attempt = await getOwnedInProgressAttempt(userId, attemptId);

  const now = new Date();
  if (now.getTime() > attempt.endsAt.getTime() + GRACE_MS) {
    throw new ApiError(400, "Time is up — this exam has ended");
  }

  await db
    .insertInto("liveExamAnswers")
    .values({
      attemptId,
      questionId: input.questionId,
      selectedOption: input.selectedOption ?? null,
      markedForReview: input.markedForReview ?? false,
    })
    .onDuplicateKeyUpdate({
      questionId: input.questionId,
      ...(input.selectedOption !== undefined ? { selectedOption: input.selectedOption } : {}),
      ...(input.markedForReview !== undefined ? { markedForReview: input.markedForReview } : {}),
    })
    .execute();

  return { saved: true };
}

export async function submitLiveExam(userId: number, attemptId: number, input: SubmitLiveExamInput) {
  await getOwnedInProgressAttempt(userId, attemptId);

  const examInfo = await db
    .selectFrom("liveExamAttempts")
    .innerJoin("liveExams", "liveExams.id", "liveExamAttempts.liveExamId")
    .innerJoin("questionSets", "questionSets.id", "liveExams.questionSetId")
    .select(["questionSets.negativeMarking as negativeMarking"])
    .where("liveExamAttempts.id", "=", attemptId)
    .executeTakeFirst();
  if (!examInfo) throw new ApiError(404, "Live exam not found");

  if (input.answers && input.answers.length > 0) {
    await db.transaction().execute(async (trx) => {
      for (const a of input.answers!) {
        await trx
          .insertInto("liveExamAnswers")
          .values({ attemptId, questionId: a.questionId, selectedOption: a.selectedOption })
          .onDuplicateKeyUpdate({ selectedOption: a.selectedOption })
          .execute();
      }
    });
  }

  const savedAnswers = await db
    .selectFrom("liveExamAnswers")
    .innerJoin("questions", "questions.id", "liveExamAnswers.questionId")
    .select([
      "liveExamAnswers.id as id",
      "liveExamAnswers.selectedOption as selectedOption",
      "questions.correctOption as correctOption",
      "questions.marks as marks",
    ])
    .where("liveExamAnswers.attemptId", "=", attemptId)
    .execute();

  const negativeMarking = Number(examInfo.negativeMarking);
  let score = 0;

  await db.transaction().execute(async (trx) => {
    for (const a of savedAnswers) {
      let marksAwarded = 0;
      let isCorrect: boolean | null = null;
      if (a.selectedOption) {
        isCorrect = a.selectedOption === a.correctOption;
        marksAwarded = isCorrect ? Number(a.marks) : -(negativeMarking * Number(a.marks));
      }
      score += marksAwarded;
      await trx
        .updateTable("liveExamAnswers")
        .set({ isCorrect, marksAwarded: String(marksAwarded) })
        .where("id", "=", a.id)
        .execute();
    }
    await trx
      .updateTable("liveExamAttempts")
      .set({ status: "submitted", submittedAt: new Date(), score: String(score) })
      .where("id", "=", attemptId)
      .execute();
  });

  await gamificationService.awardActivity(userId, XP_RULES.LIVE_EXAM_SUBMIT);

  return getAttemptResult(userId, attemptId);
}

export async function getAttemptResult(userId: number, attemptId: number) {
  const attempt = await db
    .selectFrom("liveExamAttempts")
    .innerJoin("liveExams", "liveExams.id", "liveExamAttempts.liveExamId")
    .selectAll("liveExamAttempts")
    .select(["liveExams.title as examTitle"])
    .where("liveExamAttempts.id", "=", attemptId)
    .executeTakeFirst();
  if (!attempt || attempt.userId !== userId) throw new ApiError(404, "Attempt not found");

  const answers = await db
    .selectFrom("liveExamAnswers")
    .innerJoin("questions", "questions.id", "liveExamAnswers.questionId")
    .leftJoin("chapters", "chapters.id", "questions.chapterId")
    .leftJoin("subjects", "subjects.id", "questions.subjectId")
    .select([
      "liveExamAnswers.questionId as questionId",
      "liveExamAnswers.selectedOption as selectedOption",
      "liveExamAnswers.isCorrect as isCorrect",
      "liveExamAnswers.marksAwarded as marksAwarded",
      "questions.questionText as questionText",
      "questions.optionA as optionA",
      "questions.optionB as optionB",
      "questions.optionC as optionC",
      "questions.optionD as optionD",
      "questions.correctOption as correctOption",
      "questions.explanation as explanation",
      "questions.difficulty as difficulty",
      "chapters.title as chapterTitle",
      "subjects.title as subjectTitle",
    ])
    .where("liveExamAnswers.attemptId", "=", attemptId)
    .execute();

  const correctCount = answers.filter((a) => a.isCorrect === true).length;
  const wrongCount = answers.filter((a) => a.isCorrect === false).length;
  const unansweredCount = answers.filter((a) => a.selectedOption === null).length;

  const allScores = await db
    .selectFrom("liveExamAttempts")
    .select(["userId", "score"])
    .where("liveExamId", "=", attempt.liveExamId)
    .where("status", "=", "submitted")
    .orderBy("score", "desc")
    .execute();
  const rank = allScores.findIndex((a) => a.userId === userId) + 1;

  const bySubject = new Map<string, { correct: number; total: number }>();
  const byChapter = new Map<string, { correct: number; total: number }>();
  const byDifficulty = new Map<string, { correct: number; total: number }>();

  for (const a of answers) {
    const subjectKey = a.subjectTitle ?? "Unassigned";
    const chapterKey = a.chapterTitle ?? "Unassigned";
    const diffKey = a.difficulty ?? "unrated";

    for (const [map, key] of [
      [bySubject, subjectKey],
      [byChapter, chapterKey],
      [byDifficulty, diffKey],
    ] as const) {
      const entry = map.get(key) ?? { correct: 0, total: 0 };
      entry.total += 1;
      if (a.isCorrect) entry.correct += 1;
      map.set(key, entry);
    }
  }

  const toArray = (m: Map<string, { correct: number; total: number }>) =>
    Array.from(m.entries()).map(([label, stats]) => ({ label, ...stats }));

  return {
    id: attempt.id,
    examTitle: attempt.examTitle,
    status: attempt.status,
    score: attempt.score,
    totalMarks: attempt.totalMarks,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    correctCount,
    wrongCount,
    unansweredCount,
    rank: rank || null,
    totalParticipants: allScores.length,
    subjectAnalysis: toArray(bySubject),
    chapterAnalysis: toArray(byChapter),
    difficultyAnalysis: toArray(byDifficulty),
    answers: answers.map((a) => ({
      questionId: a.questionId,
      questionText: a.questionText,
      optionA: a.optionA,
      optionB: a.optionB,
      optionC: a.optionC,
      optionD: a.optionD,
      correctOption: a.correctOption,
      selectedOption: a.selectedOption,
      isCorrect: a.isCorrect,
      marksAwarded: a.marksAwarded,
      explanation: a.explanation,
    })),
  };
}

export async function getLeaderboard(liveExamId: number) {
  const attempts = await db
    .selectFrom("liveExamAttempts")
    .innerJoin("users", "users.id", "liveExamAttempts.userId")
    .select([
      "liveExamAttempts.id as id",
      "liveExamAttempts.score as score",
      "liveExamAttempts.submittedAt as submittedAt",
      "users.name as name",
    ])
    .where("liveExamAttempts.liveExamId", "=", liveExamId)
    .where("liveExamAttempts.status", "=", "submitted")
    .orderBy("liveExamAttempts.score", "desc")
    .orderBy("liveExamAttempts.submittedAt", "asc")
    .limit(50)
    .execute();
  return attempts.map((a, i) => ({
    rank: i + 1,
    attemptId: a.id,
    name: a.name,
    score: a.score,
    submittedAt: a.submittedAt,
  }));
}

export async function getCertificateData(requesterId: number, requesterRole: string, attemptId: number) {
  const attempt = await db
    .selectFrom("liveExamAttempts")
    .innerJoin("liveExams", "liveExams.id", "liveExamAttempts.liveExamId")
    .innerJoin("users", "users.id", "liveExamAttempts.userId")
    .selectAll("liveExamAttempts")
    .select(["liveExams.title as examTitle", "users.name as studentName"])
    .where("liveExamAttempts.id", "=", attemptId)
    .executeTakeFirst();
  if (!attempt) throw new ApiError(404, "Attempt not found");
  if (requesterRole !== "admin" && attempt.userId !== requesterId) {
    throw new ApiError(403, "Not your certificate");
  }
  if (attempt.status !== "submitted") throw new ApiError(400, "This attempt has not been submitted yet");

  const allScores = await db
    .selectFrom("liveExamAttempts")
    .select(["userId", "score"])
    .where("liveExamId", "=", attempt.liveExamId)
    .where("status", "=", "submitted")
    .orderBy("score", "desc")
    .execute();
  const rank = allScores.findIndex((a) => a.userId === attempt.userId) + 1;

  return {
    studentName: attempt.studentName,
    examTitle: attempt.examTitle,
    score: attempt.score,
    totalMarks: attempt.totalMarks,
    rank: rank || null,
    totalParticipants: allScores.length,
    submittedAt: attempt.submittedAt,
  };
}
