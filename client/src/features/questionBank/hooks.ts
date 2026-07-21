import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as questionBankApi from "./api";
import type { CreateQuestionInput, UpdateQuestionInput } from "./types";

export function useQuestions(filters: { chapterId?: number; subjectId?: number }) {
  return useQuery({
    queryKey: ["question-bank", filters],
    queryFn: () => questionBankApi.fetchQuestions(filters),
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQuestionInput) => questionBankApi.createQuestion(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["question-bank"] }),
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateQuestionInput }) =>
      questionBankApi.updateQuestion(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["question-bank"] }),
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => questionBankApi.deleteQuestion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["question-bank"] }),
  });
}

export function useUploadCsvDryRun() {
  return useMutation({
    mutationFn: ({
      chapterId,
      defaultMarks,
      file,
    }: {
      chapterId: number;
      defaultMarks: number;
      file: File;
    }) => questionBankApi.uploadCsvDryRun(chapterId, defaultMarks, file),
  });
}

export function useConfirmCsvImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subjectId,
      chapterId,
      rows,
    }: {
      subjectId: number;
      chapterId: number;
      rows: Parameters<typeof questionBankApi.confirmCsvImport>[2];
    }) => questionBankApi.confirmCsvImport(subjectId, chapterId, rows),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["question-bank"] }),
  });
}
