import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import * as gamificationService from "../gamification/service";
import { XP_RULES } from "../gamification/badges";
import { SubmitPracticeInput } from "./schema";

export async function startPractice(userId: number, questionSetId: number) {
  const set = await prisma.questionSet.findUnique({
    where: { id: questionSetId },
    include: { items: { include: { question: true }, orderBy: { orderIndex: "asc" } } },
  });
  if (!set || !set.isPublished) throw new ApiError(404, "Question set not found");
  if (set.items.length === 0) throw new ApiError(400, "This question set has no questions yet");

  const existing = await prisma.practiceAttempt.findFirst({
    where: { userId, questionSetId, status: "in_progress" },
  });

  const totalMarks = set.items.reduce((sum, item) => sum + Number(item.question.marks), 0);

  const attempt =
    existing ??
    (await prisma.practiceAttempt.create({
      data: { userId, questionSetId, totalMarks },
    }));

  return {
    attempt,
    questions: set.items.map((item) => ({
      id: item.question.id,
      questionText: item.question.questionText,
      optionA: item.question.optionA,
      optionB: item.question.optionB,
      optionC: item.question.optionC,
      optionD: item.question.optionD,
      marks: item.question.marks,
    })),
    negativeMarking: set.negativeMarking,
  };
}

export async function submitPractice(userId: number, attemptId: number, input: SubmitPracticeInput) {
  const attempt = await prisma.practiceAttempt.findUnique({
    where: { id: attemptId },
    include: { questionSet: true },
  });
  if (!attempt || attempt.userId !== userId) throw new ApiError(404, "Attempt not found");
  if (attempt.status === "submitted") throw new ApiError(409, "This attempt has already been submitted");

  const questionIds = input.answers.map((a) => a.questionId);
  const questions = await prisma.question.findMany({ where: { id: { in: questionIds } } });
  const questionById = new Map(questions.map((q) => [q.id, q]));
  const negativeMarking = Number(attempt.questionSet.negativeMarking);

  let score = 0;
  const answerRows = input.answers.map((answer) => {
    const question = questionById.get(answer.questionId);
    if (!question) throw new ApiError(400, `Unknown question id ${answer.questionId}`);

    let marksAwarded = 0;
    let isCorrect: boolean | null = null;
    if (answer.selectedOption) {
      isCorrect = answer.selectedOption === question.correctOption;
      marksAwarded = isCorrect ? Number(question.marks) : -(negativeMarking * Number(question.marks));
    }
    score += marksAwarded;

    return {
      attemptId,
      questionId: answer.questionId,
      selectedOption: answer.selectedOption,
      isCorrect,
      marksAwarded,
    };
  });

  await prisma.$transaction([
    prisma.attemptAnswer.deleteMany({ where: { attemptId } }),
    prisma.attemptAnswer.createMany({ data: answerRows }),
    prisma.practiceAttempt.update({
      where: { id: attemptId },
      data: { status: "submitted", submittedAt: new Date(), score },
    }),
  ]);

  await gamificationService.awardActivity(userId, XP_RULES.PRACTICE_SUBMIT);

  return getAttemptDetail(userId, attemptId);
}

export async function getAttemptDetail(userId: number, attemptId: number) {
  const attempt = await prisma.practiceAttempt.findUnique({
    where: { id: attemptId },
    include: {
      questionSet: true,
      answers: { include: { question: true } },
    },
  });
  if (!attempt || attempt.userId !== userId) throw new ApiError(404, "Attempt not found");

  const correctCount = attempt.answers.filter((a) => a.isCorrect === true).length;
  const wrongCount = attempt.answers.filter((a) => a.isCorrect === false).length;
  const unansweredCount = attempt.answers.filter((a) => a.selectedOption === null).length;

  return {
    id: attempt.id,
    questionSetId: attempt.questionSetId,
    questionSetTitle: attempt.questionSet.title,
    status: attempt.status,
    score: attempt.score,
    totalMarks: attempt.totalMarks,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    correctCount,
    wrongCount,
    unansweredCount,
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

export async function listMyAttempts(userId: number) {
  return prisma.practiceAttempt.findMany({
    where: { userId },
    include: { questionSet: true },
    orderBy: { startedAt: "desc" },
  });
}
