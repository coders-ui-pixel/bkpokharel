import { apiClient } from "../../lib/apiClient";
import type { AdminFlashCard, CourseFlashCard, FlashCard, UpdateProgressInput } from "./types";

export async function fetchFlashCards(chapterId: number): Promise<FlashCard[]> {
  const { data } = await apiClient.get<{ flashCards: FlashCard[] }>(
    `/chapters/${chapterId}/flashcards`
  );
  return data.flashCards;
}

export async function fetchFlashCardsForCourse(courseId: number): Promise<CourseFlashCard[]> {
  const { data } = await apiClient.get<{ flashCards: CourseFlashCard[] }>(
    `/flashcards/course/${courseId}`
  );
  return data.flashCards;
}

export async function fetchFlashCardsAdmin(chapterId: number): Promise<AdminFlashCard[]> {
  const { data } = await apiClient.get<{ flashCards: AdminFlashCard[] }>(
    `/chapters/${chapterId}/flashcards`
  );
  return data.flashCards;
}

export async function reorderFlashCard(id: number, direction: "up" | "down"): Promise<void> {
  await apiClient.put(`/flashcards/${id}/reorder`, { direction });
}

export async function createFlashCard(
  chapterId: number,
  front: string,
  back: string
): Promise<FlashCard> {
  const { data } = await apiClient.post<{ flashCard: FlashCard }>(
    `/chapters/${chapterId}/flashcards`,
    { front, back }
  );
  return data.flashCard;
}

export async function deleteFlashCard(id: number): Promise<void> {
  await apiClient.delete(`/flashcards/${id}`);
}

export async function updateFlashCardProgress(
  id: number,
  input: UpdateProgressInput
): Promise<void> {
  await apiClient.put(`/flashcards/${id}/progress`, input);
}
