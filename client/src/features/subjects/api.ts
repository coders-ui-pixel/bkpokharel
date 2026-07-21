import { apiClient } from "../../lib/apiClient";
import type { Chapter, ChapterInput, StandaloneSubjectInput, Subject, SubjectInput } from "./types";

export async function fetchSubjects(courseId: number): Promise<Subject[]> {
  const { data } = await apiClient.get<{ subjects: Subject[] }>(`/courses/${courseId}/subjects`);
  return data.subjects;
}

export async function fetchAllSubjects(unassignedOnly = false): Promise<Subject[]> {
  const { data } = await apiClient.get<{ subjects: Subject[] }>(
    `/subjects${unassignedOnly ? "?unassigned=true" : ""}`
  );
  return data.subjects;
}

export async function createStandaloneSubject(input: StandaloneSubjectInput): Promise<Subject> {
  const { data } = await apiClient.post<{ subject: Subject }>(`/subjects`, input);
  return data.subject;
}

export async function assignSubjectToCourse(subjectId: number, courseId: number | null): Promise<Subject> {
  const { data } = await apiClient.put<{ subject: Subject }>(`/subjects/${subjectId}/assign`, { courseId });
  return data.subject;
}

export async function updateSubjectById(subjectId: number, input: Partial<SubjectInput>): Promise<Subject> {
  const { data } = await apiClient.put<{ subject: Subject }>(`/subjects/${subjectId}`, input);
  return data.subject;
}

export async function deleteSubjectById(subjectId: number): Promise<void> {
  await apiClient.delete(`/subjects/${subjectId}`);
}

export async function fetchSubject(id: number): Promise<Subject> {
  const { data } = await apiClient.get<{ subject: Subject }>(`/subjects/${id}`);
  return data.subject;
}

export async function createSubject(courseId: number, input: SubjectInput): Promise<Subject> {
  const { data } = await apiClient.post<{ subject: Subject }>(
    `/courses/${courseId}/subjects`,
    input
  );
  return data.subject;
}

export async function updateSubject(
  courseId: number,
  subjectId: number,
  input: Partial<SubjectInput>
): Promise<Subject> {
  const { data } = await apiClient.put<{ subject: Subject }>(
    `/courses/${courseId}/subjects/${subjectId}`,
    input
  );
  return data.subject;
}

export async function deleteSubject(courseId: number, subjectId: number): Promise<void> {
  await apiClient.delete(`/courses/${courseId}/subjects/${subjectId}`);
}

export async function createChapter(subjectId: number, input: ChapterInput): Promise<Chapter> {
  const { data } = await apiClient.post<{ chapter: Chapter }>(
    `/subjects/${subjectId}/chapters`,
    input
  );
  return data.chapter;
}

export async function updateChapter(
  subjectId: number,
  chapterId: number,
  input: Partial<ChapterInput>
): Promise<Chapter> {
  const { data } = await apiClient.put<{ chapter: Chapter }>(
    `/subjects/${subjectId}/chapters/${chapterId}`,
    input
  );
  return data.chapter;
}

export async function deleteChapter(subjectId: number, chapterId: number): Promise<void> {
  await apiClient.delete(`/subjects/${subjectId}/chapters/${chapterId}`);
}
