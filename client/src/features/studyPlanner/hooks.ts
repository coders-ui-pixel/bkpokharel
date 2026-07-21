import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as studyPlannerApi from "./api";
import type { CreateStudyTaskInput, UpdateStudyTaskInput } from "./types";

const KEY = ["study-tasks"];

export function useStudyTasks() {
  return useQuery({
    queryKey: KEY,
    queryFn: studyPlannerApi.fetchStudyTasks,
  });
}

export function useCreateStudyTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStudyTaskInput) => studyPlannerApi.createStudyTask(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateStudyTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateStudyTaskInput }) =>
      studyPlannerApi.updateStudyTask(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: KEY });
      if (variables.input.isDone !== undefined) {
        queryClient.invalidateQueries({ queryKey: ["gamification"] });
      }
    },
  });
}

export function useDeleteStudyTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => studyPlannerApi.deleteStudyTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
