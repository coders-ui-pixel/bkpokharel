import { apiClient } from "../../lib/apiClient";
import type { AnswerInput, AttemptListItem, AttemptResult, StartPracticeResult } from "./types";

export async function startPractice(questionSetId: number): Promise<StartPracticeResult> {
  const { data } = await apiClient.post<StartPracticeResult>("/attempts/practice", {
    questionSetId,
  });
  return data;
}

export async function submitPractice(
  attemptId: number,
  answers: AnswerInput[]
): Promise<AttemptResult> {
  const { data } = await apiClient.post<{ result: AttemptResult }>(
    `/attempts/${attemptId}/submit`,
    { answers }
  );
  return data.result;
}

export async function fetchAttempt(id: number): Promise<AttemptResult> {
  const { data } = await apiClient.get<{ result: AttemptResult }>(`/attempts/${id}`);
  return data.result;
}

export async function fetchMyAttempts(): Promise<AttemptListItem[]> {
  const { data } = await apiClient.get<{ attempts: AttemptListItem[] }>("/attempts/me");
  return data.attempts;
}
