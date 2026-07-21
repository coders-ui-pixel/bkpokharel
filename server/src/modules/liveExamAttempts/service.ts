import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import * as gamificationService from "../gamification/service";
import { XP_RULES } from "../gamification/badges";
import { SaveAnswerInput, SubmitLiveExamInput } from "./schema";

const GRACE_MS = 5000;

async function assertEnrolledIfNeeded(userId: number, courseId: number | null) {
  if (!courseId) return;
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment || enrollment.status !== "approved") {
    throw new ApiError(403, "You must be enrolled in this course to join this live exam");
  }
}

export async function joinLiveExam(userId: number, liveExamId: number) {
  const exam = await prisma.liveExam.findUnique({
    where: { id: liveExamId },
    include: {
      questionSet: {
        include: { items: { include: { question: true }, orderBy: { orderIndex: "asc" } } },
      },
    },
  });
  if (!exam) throw new ApiError(404, "Live exam not found");
  if (exam.status === "cancelled") throw new ApiError(400, "This live exam has been cancelled");

  const now = new Date();
  if (now < exam.startsAt) throw new ApiError(400, "This exam hasn't started yet");
  if (now > exam.endsAt) throw new ApiError(400, "This exam has already ended");

  await assertEnrolledIfNeeded(userId, exam.courseId);

  if (exam.questionSet.items.length === 0) {
    throw new ApiError(400, "This exam's question set has no questions yet");
  }

  let attempt = await prisma.liveExamAttempt.findUnique({
    where: { userId_liveExamId: { userId, liveExamId } },
    include: { answers: true },
  });

  if (attempt?.status === "submitted") {
    return { alreadySubmitted: true, attemptId: attempt.id };
  }

  if (!attempt) {
    const totalMarks = exam.questionSet.items.reduce(
      (sum, item) => sum + Number(item.question.marks),
      0
    );
    attempt = await prisma.liveExamAttempt.create({
      data: { userId, liveExamId, totalMarks },
      include: { answers: true },
    });
  }

  return {
    alreadySubmitted: false,
    attempt: { id: attempt.id, startedAt: attempt.startedAt },
    exam: { id: exam.id, title: exam.title, startsAt: exam.startsAt, endsAt: exam.endsAt },
    negativeMarking: exam.questionSet.negativeMarking,
    serverNow: now,
    questions: exam.questionSet.items.map((item) => ({
      id: item.question.id,
      questionText: item.question.questionText,
      optionA: item.question.optionA,
      optionB: item.question.optionB,
      optionC: item.question.optionC,
      optionD: item.question.optionD,
      marks: item.question.marks,
    })),
    existingAnswers: attempt.answers.map((a) => ({
      questionId: a.questionId,
      selectedOption: a.selectedOption,
      markedForReview: a.markedForReview,
    })),
  };
}

async function getOwnedInProgressAttempt(userId: number, attemptId: number) {
  const attempt = await prisma.liveExamAttempt.findUnique({
    where: { id: attemptId },
    include: { liveExam: true },
  });
  if (!attempt || attempt.userId !== userId) throw new ApiError(404, "Attempt not found");
  if (attempt.status !== "in_progress") {
    throw new ApiError(409, "This attempt has already been submitted");
  }
  return attempt;
}

export async function saveAnswer(userId: number, attemptId: number, input: SaveAnswerInput) {
  const attempt = await getOwnedInProgressAttempt(userId, attemptId);

  const now = new Date();
  if (now.getTime() > attempt.liveExam.endsAt.getTime() + GRACE_MS) {
    throw new ApiError(400, "Time is up — this exam has ended");
  }

  await prisma.liveExamAnswer.upsert({
    where: { attemptId_questionId: { attemptId, questionId: input.questionId } },
    create: {
      attemptId,
      questionId: input.questionId,
      selectedOption: input.selectedOption ?? null,
      markedForReview: input.markedForReview ?? false,
    },
    update: {
      ...(input.selectedOption !== undefined ? { selectedOption: input.selectedOption } : {}),
      ...(input.markedForReview !== undefined ? { markedForReview: input.markedForReview } : {}),
    },
  });

  return { saved: true };
}

export async function submitLiveExam(
  userId: number,
  attemptId: number,
  input: SubmitLiveExamInput
) {
  const attempt = await getOwnedInProgressAttempt(userId, attemptId);
  const exam = await prisma.liveExam.findUnique({
    where: { id: attempt.liveExamId },
    include: { questionSet: true },
  });
  if (!exam) throw new ApiError(404, "Live exam not found");

  if (input.answers && input.answers.length > 0) {
    await prisma.$transaction(
      input.answers.map((a) =>
        prisma.liveExamAnswer.upsert({
          where: { attemptId_questionId: { attemptId, questionId: a.questionId } },
          create: { attemptId, questionId: a.questionId, selectedOption: a.selectedOption },
          update: { selectedOption: a.selectedOption },
        })
      )
    );
  }

  const savedAnswers = await prisma.liveExamAnswer.findMany({
    where: { attemptId },
    include: { question: true },
  });

  const negativeMarking = Number(exam.questionSet.negativeMarking);
  let score = 0;

  await prisma.$transaction(
    savedAnswers.map((a) => {
      let marksAwarded = 0;
      let isCorrect: boolean | null = null;
      if (a.selectedOption) {
        isCorrect = a.selectedOption === a.question.correctOption;
        marksAwarded = isCorrect ? Number(a.question.marks) : -(negativeMarking * Number(a.question.marks));
      }
      score += marksAwarded;
      return prisma.liveExamAnswer.update({
        where: { id: a.id },
        data: { isCorrect, marksAwarded },
      });
    })
  );

  await prisma.liveExamAttempt.update({
    where: { id: attemptId },
    data: { status: "submitted", submittedAt: new Date(), score },
  });

  await gamificationService.awardActivity(userId, XP_RULES.LIVE_EXAM_SUBMIT);

  return getAttemptResult(userId, attemptId);
}

export async function getAttemptResult(userId: number, attemptId: number) {
  const attempt = await prisma.liveExamAttempt.findUnique({
    where: { id: attemptId },
    include: {
      liveExam: true,
      answers: {
        include: {
          question: {
            include: { chapter: true, subject: true },
          },
        },
      },
    },
  });
  if (!attempt || attempt.userId !== userId) throw new ApiError(404, "Attempt not found");

  const correctCount = attempt.answers.filter((a) => a.isCorrect === true).length;
  const wrongCount = attempt.answers.filter((a) => a.isCorrect === false).length;
  const unansweredCount = attempt.answers.filter((a) => a.selectedOption === null).length;

  // Rank among all submitted attempts for this exam, by score desc.
  const allScores = await prisma.liveExamAttempt.findMany({
    where: { liveExamId: attempt.liveExamId, status: "submitted" },
    select: { userId: true, score: true },
    orderBy: { score: "desc" },
  });
  const rank = allScores.findIndex((a) => a.userId === userId) + 1;

  const bySubject = new Map<string, { correct: number; total: number }>();
  const byChapter = new Map<string, { correct: number; total: number }>();
  const byDifficulty = new Map<string, { correct: number; total: number }>();

  for (const a of attempt.answers) {
    const subjectKey = a.question.subject?.title ?? "Unassigned";
    const chapterKey = a.question.chapter?.title ?? "Unassigned";
    const diffKey = a.question.difficulty ?? "unrated";

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
    examTitle: attempt.liveExam.title,
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
    answers: attempt.answers.map((a) => ({
      questionId: a.questionId,
      questionText: a.question.questionText,
      optionA: a.question.optionA,
      optionB: a.question.optionB,
      optionC: a.question.optionC,
      optionD: a.question.optionD,
      correctOption: a.question.correctOption,
      selectedOption: a.selectedOption,
      isCorrect: a.isCorrect,
      marksAwarded: a.marksAwarded,
      explanation: a.question.explanation,
    })),
  };
}

export async function getLeaderboard(liveExamId: number) {
  const attempts = await prisma.liveExamAttempt.findMany({
    where: { liveExamId, status: "submitted" },
    include: { user: { select: { name: true } } },
    orderBy: [{ score: "desc" }, { submittedAt: "asc" }],
    take: 50,
  });
  return attempts.map((a, i) => ({
    rank: i + 1,
    attemptId: a.id,
    name: a.user.name,
    score: a.score,
    submittedAt: a.submittedAt,
  }));
}

export async function getCertificateData(
  requesterId: number,
  requesterRole: string,
  attemptId: number
) {
  const attempt = await prisma.liveExamAttempt.findUnique({
    where: { id: attemptId },
    include: { liveExam: true, user: { select: { name: true } } },
  });
  if (!attempt) throw new ApiError(404, "Attempt not found");
  if (requesterRole !== "admin" && attempt.userId !== requesterId) {
    throw new ApiError(403, "Not your certificate");
  }
  if (attempt.status !== "submitted") throw new ApiError(400, "This attempt has not been submitted yet");

  const allScores = await prisma.liveExamAttempt.findMany({
    where: { liveExamId: attempt.liveExamId, status: "submitted" },
    select: { userId: true, score: true },
    orderBy: { score: "desc" },
  });
  const rank = allScores.findIndex((a) => a.userId === attempt.userId) + 1;

  return {
    studentName: attempt.user.name,
    examTitle: attempt.liveExam.title,
    score: attempt.score,
    totalMarks: attempt.totalMarks,
    rank: rank || null,
    totalParticipants: allScores.length,
    submittedAt: attempt.submittedAt,
  };
}
