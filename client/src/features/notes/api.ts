import { apiClient } from "../../lib/apiClient";
import type { Note } from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export function noteFileUrl(chapterId: number, noteId: number): string {
  return `${API_BASE}/chapters/${chapterId}/notes/${noteId}/file`;
}

export async function fetchNotes(chapterId: number): Promise<Note[]> {
  const { data } = await apiClient.get<{ notes: Note[] }>(`/chapters/${chapterId}/notes`);
  return data.notes;
}

export async function uploadNote(chapterId: number, title: string, file: File): Promise<Note> {
  const form = new FormData();
  form.append("title", title);
  form.append("file", file);
  const { data } = await apiClient.post<{ note: Note }>(`/chapters/${chapterId}/notes`, form);
  return data.note;
}

export async function replaceNote(chapterId: number, noteId: number, file: File): Promise<Note> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.put<{ note: Note }>(
    `/chapters/${chapterId}/notes/${noteId}/replace`,
    form
  );
  return data.note;
}

export async function deleteNote(chapterId: number, noteId: number): Promise<void> {
  await apiClient.delete(`/chapters/${chapterId}/notes/${noteId}`);
}

export async function reorderNote(
  chapterId: number,
  noteId: number,
  direction: "up" | "down"
): Promise<void> {
  await apiClient.put(`/chapters/${chapterId}/notes/${noteId}/reorder`, { direction });
}
