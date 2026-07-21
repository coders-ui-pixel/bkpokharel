import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as studentsApi from "./api";
import type { UpdateStudentInput } from "./types";

export function useStudents(filters: { search?: string; status?: "active" | "suspended" }) {
  return useQuery({
    queryKey: ["admin-students", filters],
    queryFn: () => studentsApi.fetchStudents(filters),
  });
}

export function useStudentDetail(id: number) {
  return useQuery({
    queryKey: ["admin-students", "detail", id],
    queryFn: () => studentsApi.fetchStudentDetail(id),
    enabled: Number.isFinite(id),
  });
}

export function useUpdateStudent(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateStudentInput) => studentsApi.updateStudent(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    },
  });
}

export function useSetStudentSuspended() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      studentsApi.setStudentSuspended(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-students"] }),
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => studentsApi.deleteStudent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-students"] }),
  });
}
