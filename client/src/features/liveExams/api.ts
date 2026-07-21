import { apiClient } from "../../lib/apiClient";
import type { CreateLiveExamInput, LiveExam, LiveExamDetail } from "./types";

export async function fetchLiveExams(): Promise<LiveExam[]> {
  const { data } = await apiClient.get<{ liveExams: LiveExam[] }>("/live-exams");
  return data.liveExams;
}

export async function fetchLiveExam(id: number): Promise<LiveExamDetail> {
  const { data } = await apiClient.get<{ liveExam: LiveExamDetail }>(`/live-exams/${id}`);
  return data.liveExam;
}

export async function createLiveExam(input: CreateLiveExamInput): Promise<LiveExam> {
  const { data } = await apiClient.post<{ liveExam: LiveExam }>("/live-exams", input);
  return data.liveExam;
}

export async function cancelLiveExam(id: number): Promise<void> {
  await apiClient.put(`/live-exams/${id}/cancel`);
}

export async function deleteLiveExam(id: number): Promise<void> {
  await apiClient.delete(`/live-exams/${id}`);
}
