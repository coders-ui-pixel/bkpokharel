import { apiClient } from "../../lib/apiClient";
import type { ImportantQuestionItem } from "./types";

export async function fetchImportantQuestions(chapterId: number): Promise<ImportantQuestionItem[]> {
  const { data } = await apiClient.get<{ importantQuestions: ImportantQuestionItem[] }>(
    `/chapters/${chapterId}/important-questions`
  );
  return data.importantQuestions;
}

export async function uploadImportantQuestion(
  chapterId: number,
  title: string,
  file: File
): Promise<ImportantQuestionItem> {
  const form = new FormData();
  form.append("title", title);
  form.append("file", file);
  const { data } = await apiClient.post<{ importantQuestion: ImportantQuestionItem }>(
    `/chapters/${chapterId}/important-questions`,
    form
  );
  return data.importantQuestion;
}

export async function deleteImportantQuestion(chapterId: number, id: number): Promise<void> {
  await apiClient.delete(`/chapters/${chapterId}/important-questions/${id}`);
}

export async function reorderImportantQuestion(
  chapterId: number,
  id: number,
  direction: "up" | "down"
): Promise<void> {
  await apiClient.put(`/chapters/${chapterId}/important-questions/${id}/reorder`, { direction });
}
