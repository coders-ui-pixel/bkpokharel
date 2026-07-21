import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as importantQuestionsApi from "./api";

export function useImportantQuestions(chapterId: number) {
  return useQuery({
    queryKey: ["important-questions", chapterId],
    queryFn: () => importantQuestionsApi.fetchImportantQuestions(chapterId),
    enabled: Number.isFinite(chapterId),
  });
}

export function useUploadImportantQuestion(chapterId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, file }: { title: string; file: File }) =>
      importantQuestionsApi.uploadImportantQuestion(chapterId, title, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["important-questions", chapterId] }),
  });
}

export function useDeleteImportantQuestion(chapterId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => importantQuestionsApi.deleteImportantQuestion(chapterId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["important-questions", chapterId] }),
  });
}

export function useReorderImportantQuestion(chapterId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, direction }: { id: number; direction: "up" | "down" }) =>
      importantQuestionsApi.reorderImportantQuestion(chapterId, id, direction),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["important-questions", chapterId] }),
  });
}
