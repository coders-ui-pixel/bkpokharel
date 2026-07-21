import { apiClient } from "../../lib/apiClient";
import type { StudentDetail, StudentListItem, UpdateStudentInput } from "./types";

export async function fetchStudents(filters: {
  search?: string;
  status?: "active" | "suspended";
}): Promise<StudentListItem[]> {
  const { data } = await apiClient.get<{ students: StudentListItem[] }>("/admin/students", {
    params: filters,
  });
  return data.students;
}

export async function fetchStudentDetail(id: number): Promise<StudentDetail> {
  const { data } = await apiClient.get<{ student: StudentDetail }>(`/admin/students/${id}`);
  return data.student;
}

export async function updateStudent(id: number, input: UpdateStudentInput): Promise<void> {
  await apiClient.put(`/admin/students/${id}`, input);
}

export async function setStudentSuspended(id: number, isActive: boolean): Promise<void> {
  await apiClient.put(`/admin/students/${id}/suspend`, { isActive });
}

export async function deleteStudent(id: number): Promise<void> {
  await apiClient.delete(`/admin/students/${id}`);
}
