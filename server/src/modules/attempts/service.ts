import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import * as gamificationService from "../gamification/service";
import { XP_RULES } from "../gamification/badges";
import { SubmitPracticeInput } from "./schema";

export async function startPractice(userId: number, questionSetId: number) {
  const set = await db.selectFrom("questionSets").selectAll().where("id", "=", questionSetId).executeTakeFirst();
  if (!set || !set.isPublished) throw new ApiError(404, "Question set not found");

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
    .where("questionSetItems.questionSetId", "=", questionSetId)
    .orderBy("questionSetItems.orderIndex", "asc")
    .execute();
  if (items.length === 0) throw new ApiError(400, "This question set has no questions yet");

  const existing = await db
    .selectFrom("practiceAttempts")
    .selectAll()
    .where("userId", "=", userId)
    .where("questionSetId", "=", questionSetId)
    .where("status", "=", "in_progress")
    .executeTakeFirst();

  const totalMarks = items.reduce((sum, item) => sum + Number(item.marks), 0);

  const attempt =
    existing ??
    (await (async () => {
      const result = await db
        .insertInto("practiceAttempts")
        .values({ userId, questionSetId, totalMarks })
        .executeTakeFirstOrThrow();
      return db
        .selectFrom("practiceAttempts")
        .selectAll()
        .where("id", "=", Number(result.insertId))
        .executeTakeFirstOrThrow();
    })());

  return {
    attempt,
    questions: items.map((item) => ({
      id: item.id,
      questionText: item.questionText,
      optionA: item.optionA,
      optionB: item.optionB,
      optionC: item.optionC,
      optionD: item.optionD,
      marks: item.marks,
    })),
    negativeMarking: set.negativeMarking,
  };
}

export async function submitPractice(userId: number, attemptId: number, input: SubmitPracticeInput) {
  const attempt = await db
    .selectFrom("practiceAttempts")
    .innerJoin("questionSets", "questionSets.id", "practiceAttempts.questionSetId")
    .select(["practiceAttempts.userId as userId", "practiceAttempts.status as status", "questionSets.negativeMarking as negativeMarking"])
    .where("practiceAttempts.id", "=", attemptId)
    .executeTakeFirst();
  if (!attempt || attempt.userId !== userId) throw new ApiError(404, "Attempt not found");
  if (attempt.status === "submitted") throw new ApiError(409, "This attempt has already been submitted");

  const questionIds = input.answers.map((a) => a.questionId);
  const questions =
    questionIds.length > 0
      ? await db.selectFrom("questions").selectAll().where("id", "in", questionIds).execute()
      : [];
  const questionById = new Map(questions.map((q) => [q.id, q]));
  const negativeMarking = Number(attempt.negativeMarking);

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
      selectedOption: answer.selectedOption ?? null,
      isCorrect,
      marksAwarded,
    };
  });

  await db.transaction().execute(async (trx) => {
    await trx.deleteFrom("attemptAnswers").where("attemptId", "=", attemptId).execute();
    if (answerRows.length > 0) {
      await trx.insertInto("attemptAnswers").values(answerRows).execute();
    }
    await trx
      .updateTable("practiceAttempts")
      .set({ status: "submitted", submittedAt: new Date(), score: String(score) })
      .where("id", "=", attemptId)
      .execute();
  });

  await gamificationService.awardActivity(userId, XP_RULES.PRACTICE_SUBMIT);

  return getAttemptDetail(userId, attemptId);
}

export async function getAttemptDetail(userId: number, attemptId: number) {
  const attempt = await db
    .selectFrom("practiceAttempts")
    .innerJoin("questionSets", "questionSets.id", "practiceAttempts.questionSetId")
    .select([
      "practiceAttempts.id as id",
      "practiceAttempts.userId as userId",
      "practiceAttempts.questionSetId as questionSetId",
      "practiceAttempts.status as status",
      "practiceAttempts.score as score",
      "practiceAttempts.totalMarks as totalMarks",
      "practiceAttempts.startedAt as startedAt",
      "practiceAttempts.submittedAt as submittedAt",
      "questionSets.title as questionSetTitle",
    ])
    .where("practiceAttempts.id", "=", attemptId)
    .executeTakeFirst();
  if (!attempt || attempt.userId !== userId) throw new ApiError(404, "Attempt not found");

  const answers = await db
    .selectFrom("attemptAnswers")
    .innerJoin("questions", "questions.id", "attemptAnswers.questionId")
    .select([
      "attemptAnswers.questionId as questionId",
      "questions.questionText as questionText",
      "questions.optionA as optionA",
      "questions.optionB as optionB",
      "questions.optionC as optionC",
      "questions.optionD as optionD",
      "questions.correctOption as correctOption",
      "attemptAnswers.selectedOption as selectedOption",
      "attemptAnswers.isCorrect as isCorrect",
      "attemptAnswers.marksAwarded as marksAwarded",
      "questions.explanation as explanation",
    ])
    .where("attemptAnswers.attemptId", "=", attemptId)
    .execute();

  const correctCount = answers.filter((a) => a.isCorrect === true).length;
  const wrongCount = answers.filter((a) => a.isCorrect === false).length;
  const unansweredCount = answers.filter((a) => a.selectedOption === null).length;

  return {
    id: attempt.id,
    questionSetId: attempt.questionSetId,
    questionSetTitle: attempt.questionSetTitle,
    status: attempt.status,
    score: attempt.score,
    totalMarks: attempt.totalMarks,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    correctCount,
    wrongCount,
    unansweredCount,
    answers,
  };
}

export async function listMyAttempts(userId: number) {
  const attempts = await db
    .selectFrom("practiceAttempts")
    .innerJoin("questionSets", "questionSets.id", "practiceAttempts.questionSetId")
    .select([
      "practiceAttempts.id as id",
      "practiceAttempts.questionSetId as questionSetId",
      "practiceAttempts.status as status",
      "practiceAttempts.score as score",
      "practiceAttempts.totalMarks as totalMarks",
      "practiceAttempts.startedAt as startedAt",
      "practiceAttempts.submittedAt as submittedAt",
      "questionSets.title as questionSetTitle",
    ])
    .where("practiceAttempts.userId", "=", userId)
    .orderBy("practiceAttempts.startedAt", "desc")
    .execute();

  return attempts.map((a) => ({
    id: a.id,
    questionSetId: a.questionSetId,
    status: a.status,
    score: a.score,
    totalMarks: a.totalMarks,
    startedAt: a.startedAt,
    submittedAt: a.submittedAt,
    questionSet: { title: a.questionSetTitle },
  }));
}
