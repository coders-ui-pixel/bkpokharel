import { apiClient } from "../../lib/apiClient";
import type { CreateQuestionInput, CsvDryRunResult, Question, UpdateQuestionInput } from "./types";

export async function fetchQuestions(filters: {
  chapterId?: number;
  subjectId?: number;
}): Promise<Question[]> {
  const { data } = await apiClient.get<{ questions: Question[] }>("/question-bank", {
    params: filters,
  });
  return data.questions;
}

export async function createQuestion(input: CreateQuestionInput): Promise<Question> {
  const { data } = await apiClient.post<{ question: Question }>("/question-bank", input);
  return data.question;
}

export async function updateQuestion(id: number, input: UpdateQuestionInput): Promise<Question> {
  const { data } = await apiClient.put<{ question: Question }>(`/question-bank/${id}`, input);
  return data.question;
}

export async function deleteQuestion(id: number): Promise<void> {
  await apiClient.delete(`/question-bank/${id}`);
}

export async function uploadCsvDryRun(
  chapterId: number,
  defaultMarks: number,
  file: File
): Promise<CsvDryRunResult> {
  const form = new FormData();
  form.append("chapterId", String(chapterId));
  form.append("defaultMarks", String(defaultMarks));
  form.append("file", file);
  const { data } = await apiClient.post<CsvDryRunResult>("/question-bank/upload-csv", form);
  return data;
}

export async function confirmCsvImport(
  subjectId: number,
  chapterId: number,
  rows: CsvDryRunResult["validRows"]
): Promise<{ inserted: number }> {
  const { data } = await apiClient.post<{ inserted: number }>("/question-bank/upload-csv/confirm", {
    subjectId,
    chapterId,
    rows,
  });
  return data;
}
