import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as liveExamAttemptsApi from "./api";
import type { CorrectOption } from "../questionBank/types";

export function useJoinLiveExam() {
  return useMutation({
    mutationFn: (liveExamId: number) => liveExamAttemptsApi.joinLiveExam(liveExamId),
  });
}

export function useSaveAnswer() {
  return useMutation({
    mutationFn: ({
      attemptId,
      input,
    }: {
      attemptId: number;
      input: { questionId: number; selectedOption?: CorrectOption | null; markedForReview?: boolean };
    }) => liveExamAttemptsApi.saveAnswer(attemptId, input),
  });
}

export function useSubmitLiveExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      attemptId,
      answers,
    }: {
      attemptId: number;
      answers: { questionId: number; selectedOption: CorrectOption | null }[];
    }) => liveExamAttemptsApi.submitLiveExam(attemptId, answers),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gamification"] }),
  });
}

export function useAttemptResult(attemptId: number) {
  return useQuery({
    queryKey: ["live-exam-attempts", attemptId],
    queryFn: () => liveExamAttemptsApi.fetchAttemptResult(attemptId),
    enabled: Number.isFinite(attemptId),
  });
}

export function useLeaderboard(liveExamId: number) {
  return useQuery({
    queryKey: ["live-exams", "leaderboard", liveExamId],
    queryFn: () => liveExamAttemptsApi.fetchLeaderboard(liveExamId),
    enabled: Number.isFinite(liveExamId),
    refetchInterval: 15_000,
  });
}

export function useCertificate(attemptId: number) {
  return useQuery({
    queryKey: ["live-exams", "certificate", attemptId],
    queryFn: () => liveExamAttemptsApi.fetchCertificate(attemptId),
    enabled: Number.isFinite(attemptId),
  });
}
