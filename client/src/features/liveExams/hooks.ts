import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as liveExamsApi from "./api";
import type { CreateLiveExamInput } from "./types";

const QUERY_KEY = ["live-exams"];

export function useLiveExams() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: liveExamsApi.fetchLiveExams });
}

export function useLiveExam(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => liveExamsApi.fetchLiveExam(id),
    enabled: Number.isFinite(id),
    refetchInterval: 10_000,
  });
}

export function useCreateLiveExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLiveExamInput) => liveExamsApi.createLiveExam(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useCancelLiveExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => liveExamsApi.cancelLiveExam(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteLiveExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => liveExamsApi.deleteLiveExam(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
