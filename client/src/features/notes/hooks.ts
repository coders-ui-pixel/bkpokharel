import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as notesApi from "./api";

export function useNotes(chapterId: number) {
  return useQuery({
    queryKey: ["notes", chapterId],
    queryFn: () => notesApi.fetchNotes(chapterId),
    enabled: Number.isFinite(chapterId),
  });
}

export function useUploadNote(chapterId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, file }: { title: string; file: File }) =>
      notesApi.uploadNote(chapterId, title, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes", chapterId] }),
  });
}

export function useReplaceNote(chapterId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, file }: { noteId: number; file: File }) =>
      notesApi.replaceNote(chapterId, noteId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes", chapterId] }),
  });
}

export function useDeleteNote(chapterId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: number) => notesApi.deleteNote(chapterId, noteId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes", chapterId] }),
  });
}

export function useReorderNote(chapterId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, direction }: { noteId: number; direction: "up" | "down" }) =>
      notesApi.reorderNote(chapterId, noteId, direction),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes", chapterId] }),
  });
}
