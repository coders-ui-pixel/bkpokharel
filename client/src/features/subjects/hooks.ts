import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as subjectsApi from "./api";
import type { ChapterInput, StandaloneSubjectInput, SubjectInput } from "./types";

export function useSubjects(courseId: number) {
  return useQuery({
    queryKey: ["subjects", "byCourse", courseId],
    queryFn: () => subjectsApi.fetchSubjects(courseId),
    enabled: Number.isFinite(courseId),
  });
}

export function useAllSubjects(unassignedOnly = false) {
  return useQuery({
    queryKey: ["subjects", "all", unassignedOnly],
    queryFn: () => subjectsApi.fetchAllSubjects(unassignedOnly),
  });
}

export function useCreateStandaloneSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StandaloneSubjectInput) => subjectsApi.createStandaloneSubject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useAssignSubjectToCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subjectId, courseId }: { subjectId: number; courseId: number | null }) =>
      subjectsApi.assignSubjectToCourse(subjectId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useUpdateSubjectById() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subjectId, input }: { subjectId: number; input: Partial<SubjectInput> }) =>
      subjectsApi.updateSubjectById(subjectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useDeleteSubjectById() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subjectId: number) => subjectsApi.deleteSubjectById(subjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useSubject(id: number) {
  return useQuery({
    queryKey: ["subjects", id],
    queryFn: () => subjectsApi.fetchSubject(id),
    enabled: Number.isFinite(id),
  });
}

export function useCreateSubject(courseId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubjectInput) => subjectsApi.createSubject(courseId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects", "byCourse", courseId] }),
  });
}

export function useUpdateSubject(courseId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subjectId, input }: { subjectId: number; input: Partial<SubjectInput> }) =>
      subjectsApi.updateSubject(courseId, subjectId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subjects", "byCourse", courseId] });
      queryClient.invalidateQueries({ queryKey: ["subjects", variables.subjectId] });
    },
  });
}

export function useDeleteSubject(courseId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subjectId: number) => subjectsApi.deleteSubject(courseId, subjectId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects", "byCourse", courseId] }),
  });
}

export function useCreateChapter(subjectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ChapterInput) => subjectsApi.createChapter(subjectId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects", subjectId] }),
  });
}

export function useUpdateChapter(subjectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chapterId, input }: { chapterId: number; input: Partial<ChapterInput> }) =>
      subjectsApi.updateChapter(subjectId, chapterId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects", subjectId] }),
  });
}

export function useDeleteChapter(subjectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chapterId: number) => subjectsApi.deleteChapter(subjectId, chapterId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects", subjectId] }),
  });
}
