import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as attemptsApi from "./api";
import type { AnswerInput } from "./types";

export function useStartPractice() {
  return useMutation({
    mutationFn: (questionSetId: number) => attemptsApi.startPractice(questionSetId),
  });
}

export function useSubmitPractice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attemptId, answers }: { attemptId: number; answers: AnswerInput[] }) =>
      attemptsApi.submitPractice(attemptId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attempts"] });
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
    },
  });
}

export function useAttempt(id: number) {
  return useQuery({
    queryKey: ["attempts", id],
    queryFn: () => attemptsApi.fetchAttempt(id),
    enabled: Number.isFinite(id),
  });
}

export function useMyAttempts() {
  return useQuery({ queryKey: ["attempts", "me"], queryFn: attemptsApi.fetchMyAttempts });
}
