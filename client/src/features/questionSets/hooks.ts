import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as questionSetsApi from "./api";
import type { CreateQuestionSetInput } from "./types";

export function useQuestionSets(filters: { chapterId?: number; subjectId?: number; courseId?: number }) {
  return useQuery({
    queryKey: ["question-sets", filters],
    queryFn: () => questionSetsApi.fetchQuestionSets(filters),
  });
}

export function useQuestionSetForAdmin(id: number) {
  return useQuery({
    queryKey: ["question-sets", "admin", id],
    queryFn: () => questionSetsApi.fetchQuestionSetForAdmin(id),
    enabled: Number.isFinite(id),
  });
}

export function useQuestionSetSummary(id: number) {
  return useQuery({
    queryKey: ["question-sets", "summary", id],
    queryFn: () => questionSetsApi.fetchQuestionSetSummary(id),
    enabled: Number.isFinite(id),
  });
}

export function useCreateQuestionSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQuestionSetInput) => questionSetsApi.createQuestionSet(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["question-sets"] }),
  });
}

export function useUpdateQuestionSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<CreateQuestionSetInput> }) =>
      questionSetsApi.updateQuestionSet(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["question-sets"] }),
  });
}

export function useDeleteQuestionSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => questionSetsApi.deleteQuestionSet(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["question-sets"] }),
  });
}

export function useSetQuestionSetItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, questionIds }: { id: number; questionIds: number[] }) =>
      questionSetsApi.setQuestionSetItems(id, questionIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["question-sets", "admin", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["question-sets"] });
    },
  });
}
