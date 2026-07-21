import { apiClient } from "../../lib/apiClient";
import type { CorrectOption } from "../questionBank/types";
import type { CertificateData, JoinLiveExamResult, LeaderboardRow, LiveExamResult } from "./types";

export async function joinLiveExam(liveExamId: number): Promise<JoinLiveExamResult> {
  const { data } = await apiClient.post<JoinLiveExamResult>(`/live-exams/${liveExamId}/join`);
  return data;
}

export async function saveAnswer(
  attemptId: number,
  input: { questionId: number; selectedOption?: CorrectOption | null; markedForReview?: boolean }
): Promise<void> {
  await apiClient.put(`/live-exams/attempts/${attemptId}/answer`, input);
}

export async function submitLiveExam(
  attemptId: number,
  answers: { questionId: number; selectedOption: CorrectOption | null }[]
): Promise<LiveExamResult> {
  const { data } = await apiClient.post<{ result: LiveExamResult }>(
    `/live-exams/attempts/${attemptId}/submit`,
    { answers }
  );
  return data.result;
}

export async function fetchAttemptResult(attemptId: number): Promise<LiveExamResult> {
  const { data } = await apiClient.get<{ result: LiveExamResult }>(
    `/live-exams/attempts/${attemptId}`
  );
  return data.result;
}

export async function fetchLeaderboard(liveExamId: number): Promise<LeaderboardRow[]> {
  const { data } = await apiClient.get<{ leaderboard: LeaderboardRow[] }>(
    `/live-exams/${liveExamId}/leaderboard`
  );
  return data.leaderboard;
}

export async function fetchCertificate(attemptId: number): Promise<CertificateData> {
  const { data } = await apiClient.get<{ certificate: CertificateData }>(
    `/live-exams/attempts/${attemptId}/certificate`
  );
  return data.certificate;
}
