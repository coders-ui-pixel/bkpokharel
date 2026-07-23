import { parse } from "csv-parse/sync";
import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import type { Difficulty } from "../../config/enums";
import { CreateQuestionInput, UpdateQuestionInput, csvRowSchema, ConfirmCsvImportInput } from "./schema";

function toTagsJson(tags?: string[]): string | null {
  return tags && tags.length > 0 ? JSON.stringify(tags) : null;
}

export async function listQuestions(filters: {
  chapterId?: number;
  subjectId?: number;
  difficulty?: string;
}) {
  let query = db.selectFrom("questions").selectAll().where("isActive", "=", true);
  if (filters.chapterId) query = query.where("chapterId", "=", filters.chapterId);
  if (filters.subjectId) query = query.where("subjectId", "=", filters.subjectId);
  if (filters.difficulty) query = query.where("difficulty", "=", filters.difficulty as Difficulty);
  return query.orderBy("createdAt", "desc").execute();
}

export async function createQuestion(input: CreateQuestionInput, createdBy: number) {
  const result = await db
    .insertInto("questions")
    .values({
      chapterId: input.chapterId ?? null,
      subjectId: input.subjectId ?? null,
      questionText: input.questionText,
      optionA: input.optionA,
      optionB: input.optionB,
      optionC: input.optionC,
      optionD: input.optionD,
      correctOption: input.correctOption,
      marks: String(input.marks ?? 1),
      difficulty: input.difficulty ?? null,
      tags: toTagsJson(input.tags),
      explanation: input.explanation ?? null,
      createdBy,
      updatedAt: new Date(),
    })
    .executeTakeFirstOrThrow();
  return db
    .selectFrom("questions")
    .selectAll()
    .where("id", "=", Number(result.insertId))
    .executeTakeFirstOrThrow();
}

export async function updateQuestion(id: number, input: UpdateQuestionInput) {
  const existing = await db.selectFrom("questions").select("id").where("id", "=", id).executeTakeFirst();
  if (!existing) throw new ApiError(404, "Question not found");

  await db
    .updateTable("questions")
    .set({
      ...(input.chapterId !== undefined ? { chapterId: input.chapterId } : {}),
      ...(input.subjectId !== undefined ? { subjectId: input.subjectId } : {}),
      ...(input.questionText !== undefined ? { questionText: input.questionText } : {}),
      ...(input.optionA !== undefined ? { optionA: input.optionA } : {}),
      ...(input.optionB !== undefined ? { optionB: input.optionB } : {}),
      ...(input.optionC !== undefined ? { optionC: input.optionC } : {}),
      ...(input.optionD !== undefined ? { optionD: input.optionD } : {}),
      ...(input.correctOption !== undefined ? { correctOption: input.correctOption } : {}),
      ...(input.marks !== undefined ? { marks: String(input.marks) } : {}),
      ...(input.difficulty !== undefined ? { difficulty: input.difficulty } : {}),
      ...(input.tags !== undefined ? { tags: toTagsJson(input.tags) } : {}),
      ...(input.explanation !== undefined ? { explanation: input.explanation } : {}),
      updatedAt: new Date(),
    })
    .where("id", "=", id)
    .execute();
  return db.selectFrom("questions").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}

export async function deleteQuestion(id: number) {
  const existing = await db.selectFrom("questions").select("id").where("id", "=", id).executeTakeFirst();
  if (!existing) throw new ApiError(404, "Question not found");
  await db.updateTable("questions").set({ isActive: false }).where("id", "=", id).execute();
}

interface CsvRowResult {
  row: number;
  valid: boolean;
  error?: string;
  data?: {
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: "A" | "B" | "C" | "D";
    marks: number;
    difficulty?: "easy" | "medium" | "hard" | "mixed";
    tags?: string[];
    explanation?: string;
  };
}

export async function dryRunCsvImport(chapterId: number, defaultMarks: number, buffer: Buffer) {
  const chapter = await db.selectFrom("chapters").select("id").where("id", "=", chapterId).executeTakeFirst();
  if (!chapter) throw new ApiError(404, "Chapter not found");

  let records: Record<string, string>[];
  try {
    records = parse(buffer, { columns: true, skip_empty_lines: true, trim: true });
  } catch (err) {
    throw new ApiError(400, "Could not parse CSV file", { message: (err as Error).message });
  }

  const results: CsvRowResult[] = records.map((record, index) => {
    const rowNum = index + 2; // header is row 1
    const parsed = csvRowSchema.safeParse(record);
    if (!parsed.success) {
      return { row: rowNum, valid: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
    }

    const marks = parsed.data.marks && parsed.data.marks.trim() ? Number(parsed.data.marks) : defaultMarks;
    if (!(marks > 0)) {
      return { row: rowNum, valid: false, error: "marks must be a positive number" };
    }

    return {
      row: rowNum,
      valid: true,
      data: {
        questionText: parsed.data.question_text,
        optionA: parsed.data.option_a,
        optionB: parsed.data.option_b,
        optionC: parsed.data.option_c,
        optionD: parsed.data.option_d,
        correctOption: parsed.data.correct_option,
        marks,
        difficulty: parsed.data.difficulty,
        tags: parsed.data.tags
          ? parsed.data.tags.split(/[|,]/).map((t) => t.trim()).filter(Boolean)
          : undefined,
        explanation: parsed.data.explanation,
      },
    };
  });

  const validRows = results.filter((r) => r.valid);
  const invalidRows = results.filter((r) => !r.valid);

  return {
    totalRows: results.length,
    validCount: validRows.length,
    invalidCount: invalidRows.length,
    invalidRows: invalidRows.map((r) => ({ row: r.row, error: r.error })),
    validRows: validRows.map((r) => r.data),
  };
}

export async function confirmCsvImport(input: ConfirmCsvImportInput, createdBy: number) {
  const chapter = await db
    .selectFrom("chapters")
    .select("id")
    .where("id", "=", input.chapterId)
    .where("subjectId", "=", input.subjectId)
    .executeTakeFirst();
  if (!chapter) throw new ApiError(404, "Chapter not found for this subject");

  await db.transaction().execute(async (trx) => {
    for (const row of input.rows) {
      await trx
        .insertInto("questions")
        .values({
          subjectId: input.subjectId,
          chapterId: input.chapterId,
          questionText: row.questionText,
          optionA: row.optionA,
          optionB: row.optionB,
          optionC: row.optionC,
          optionD: row.optionD,
          correctOption: row.correctOption,
          marks: String(row.marks),
          difficulty: row.difficulty ?? null,
          tags: toTagsJson(row.tags),
          explanation: row.explanation ?? null,
          createdBy,
          updatedAt: new Date(),
        })
        .execute();
    }
  });
  return { inserted: input.rows.length };
}
