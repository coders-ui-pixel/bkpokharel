import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as flashcardsApi from "./api";
import type { UpdateProgressInput } from "./types";

export function useFlashCards(chapterId: number) {
  return useQuery({
    queryKey: ["flashcards", chapterId],
    queryFn: () => flashcardsApi.fetchFlashCards(chapterId),
    enabled: Number.isFinite(chapterId),
  });
}

export function useFlashCardsForCourse(courseId: number) {
  return useQuery({
    queryKey: ["flashcards", "course", courseId],
    queryFn: () => flashcardsApi.fetchFlashCardsForCourse(courseId),
    enabled: Number.isFinite(courseId),
  });
}

export function useFlashCardsAdmin(chapterId: number) {
  return useQuery({
    queryKey: ["flashcards", "admin", chapterId],
    queryFn: () => flashcardsApi.fetchFlashCardsAdmin(chapterId),
    enabled: Number.isFinite(chapterId),
  });
}

export function useReorderFlashCard(chapterId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, direction }: { id: number; direction: "up" | "down" }) =>
      flashcardsApi.reorderFlashCard(id, direction),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flashcards", "admin", chapterId] }),
  });
}

export function useCreateFlashCard(chapterId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ front, back }: { front: string; back: string }) =>
      flashcardsApi.createFlashCard(chapterId, front, back),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards", chapterId] });
      queryClient.invalidateQueries({ queryKey: ["flashcards", "admin", chapterId] });
    },
  });
}

export function useDeleteFlashCard(chapterId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => flashcardsApi.deleteFlashCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards", chapterId] });
      queryClient.invalidateQueries({ queryKey: ["flashcards", "admin", chapterId] });
    },
  });
}

export function useUpdateFlashCardProgress(chapterId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateProgressInput }) =>
      flashcardsApi.updateFlashCardProgress(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flashcards", chapterId] }),
  });
}

export function useUpdateCourseFlashCardProgress(courseId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateProgressInput }) =>
      flashcardsApi.updateFlashCardProgress(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flashcards", "course", courseId] }),
  });
}
