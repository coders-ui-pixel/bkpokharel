import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as coursesApi from "./api";
import type { CourseInput } from "./types";

export function useCourses() {
  return useQuery({ queryKey: ["courses"], queryFn: coursesApi.fetchCourses });
}

export function useSyllabus() {
  return useQuery({ queryKey: ["courses", "syllabus"], queryFn: coursesApi.fetchSyllabus });
}

export function useFeaturedCourses() {
  return useQuery({ queryKey: ["courses", "featured"], queryFn: coursesApi.fetchFeaturedCourses });
}

export function useCourse(id: number) {
  return useQuery({
    queryKey: ["courses", id],
    queryFn: () => coursesApi.fetchCourse(id),
    enabled: Number.isFinite(id),
  });
}

export function useMyEnrollments() {
  return useQuery({ queryKey: ["enrollments", "me"], queryFn: coursesApi.fetchMyEnrollments });
}

export function useMyEnrollmentForCourse(courseId: number) {
  return useQuery({
    queryKey: ["enrollments", "me", courseId],
    queryFn: () => coursesApi.fetchMyEnrollmentForCourse(courseId),
    enabled: Number.isFinite(courseId),
  });
}

export function useRequestEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      phone,
      paymentProof,
      couponCode,
    }: {
      courseId: number;
      phone: string;
      paymentProof: File | null;
      couponCode?: string;
    }) => coursesApi.requestEnrollment(courseId, phone, paymentProof, couponCode),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments", "me"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments", "me", variables.courseId] });
    },
  });
}

export function useEnrollmentRequestsForAdmin(filters: {
  status?: "pending" | "approved" | "rejected";
  courseId?: number;
}) {
  return useQuery({
    queryKey: ["enrollments", "admin", filters],
    queryFn: () => coursesApi.fetchEnrollmentRequestsForAdmin(filters),
    enabled: !!filters.courseId,
  });
}

export function usePendingEnrollmentCount(enabled = true, courseId?: number) {
  return useQuery({
    queryKey: ["enrollments", "admin", "pending-count", courseId ?? "all"],
    queryFn: () => coursesApi.fetchPendingEnrollmentCount(courseId),
    refetchInterval: 30_000,
    enabled,
  });
}

export function useReviewEnrollmentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: number; decision: "approved" | "rejected" }) =>
      coursesApi.reviewEnrollmentRequest(id, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments", "admin"] });
    },
  });
}

export function useUploadCourseCoverImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      coursesApi.uploadCourseCoverImage(id, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses", variables.id] });
    },
  });
}

export function useUploadCoursePaymentQr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      coursesApi.uploadCoursePaymentQr(id, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses", variables.id] });
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CourseInput) => coursesApi.createCourse(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<CourseInput> }) =>
      coursesApi.updateCourse(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses", variables.id] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => coursesApi.deleteCourse(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });
}
