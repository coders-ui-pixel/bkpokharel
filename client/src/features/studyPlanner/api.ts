import { apiClient } from "../../lib/apiClient";
import type { CreateStudyTaskInput, StudyTask, UpdateStudyTaskInput } from "./types";

export async function fetchStudyTasks(): Promise<StudyTask[]> {
  const { data } = await apiClient.get<{ tasks: StudyTask[] }>("/study-tasks");
  return data.tasks;
}

export async function createStudyTask(input: CreateStudyTaskInput): Promise<StudyTask> {
  const { data } = await apiClient.post<{ task: StudyTask }>("/study-tasks", input);
  return data.task;
}

export async function updateStudyTask(id: number, input: UpdateStudyTaskInput): Promise<StudyTask> {
  const { data } = await apiClient.put<{ task: StudyTask }>(`/study-tasks/${id}`, input);
  return data.task;
}

export async function deleteStudyTask(id: number): Promise<void> {
  await apiClient.delete(`/study-tasks/${id}`);
}
