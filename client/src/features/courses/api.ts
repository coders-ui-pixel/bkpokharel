import { apiClient } from "../../lib/apiClient";
import type { AdminEnrollment, Course, CourseInput, Enrollment } from "./types";

export async function fetchCourses(): Promise<Course[]> {
  const { data } = await apiClient.get<{ courses: Course[] }>("/courses");
  return data.courses;
}

export async function fetchFeaturedCourses(): Promise<Course[]> {
  const { data } = await apiClient.get<{ courses: Course[] }>("/courses", {
    params: { featured: "true" },
  });
  return data.courses;
}

export async function fetchCourse(id: number): Promise<Course> {
  const { data } = await apiClient.get<{ course: Course }>(`/courses/${id}`);
  return data.course;
}

export async function fetchSyllabus(): Promise<Course[]> {
  const { data } = await apiClient.get<{ courses: Course[] }>("/courses/syllabus");
  return data.courses;
}

export async function createCourse(input: CourseInput): Promise<Course> {
  const { data } = await apiClient.post<{ course: Course }>("/courses", input);
  return data.course;
}

export async function updateCourse(id: number, input: Partial<CourseInput>): Promise<Course> {
  const { data } = await apiClient.put<{ course: Course }>(`/courses/${id}`, input);
  return data.course;
}

export async function deleteCourse(id: number): Promise<void> {
  await apiClient.delete(`/courses/${id}`);
}

export async function uploadCourseCoverImage(id: number, file: File): Promise<Course> {
  const form = new FormData();
  form.append("image", file);
  const { data } = await apiClient.post<{ course: Course }>(`/courses/${id}/cover-image`, form);
  return data.course;
}

export async function uploadCoursePaymentQr(id: number, file: File): Promise<Course> {
  const form = new FormData();
  form.append("image", file);
  const { data } = await apiClient.post<{ course: Course }>(`/courses/${id}/payment-qr`, form);
  return data.course;
}

export async function requestEnrollment(
  courseId: number,
  phone: string,
  paymentProof: File | null,
  couponCode?: string
): Promise<Enrollment> {
  const form = new FormData();
  form.append("courseId", String(courseId));
  form.append("phone", phone);
  if (paymentProof) form.append("paymentProof", paymentProof);
  if (couponCode) form.append("couponCode", couponCode);
  const { data } = await apiClient.post<{ enrollment: Enrollment }>("/enrollments", form);
  return data.enrollment;
}

export async function fetchMyEnrollments(): Promise<Enrollment[]> {
  const { data } = await apiClient.get<{ enrollments: Enrollment[] }>("/enrollments/me");
  return data.enrollments;
}

export async function fetchMyEnrollmentForCourse(courseId: number): Promise<Enrollment | null> {
  const { data } = await apiClient.get<{ enrollment: Enrollment | null }>(
    `/enrollments/me/${courseId}`
  );
  return data.enrollment;
}

export async function fetchEnrollmentRequestsForAdmin(filters: {
  status?: "pending" | "approved" | "rejected";
  courseId?: number;
}): Promise<AdminEnrollment[]> {
  const { data } = await apiClient.get<{ enrollments: AdminEnrollment[] }>("/enrollments/admin", {
    params: filters,
  });
  return data.enrollments;
}

export async function fetchPendingEnrollmentCount(courseId?: number): Promise<number> {
  const { data } = await apiClient.get<{ count: number }>("/enrollments/admin/pending-count", {
    params: courseId ? { courseId } : undefined,
  });
  return data.count;
}

export async function reviewEnrollmentRequest(
  id: number,
  decision: "approved" | "rejected"
): Promise<Enrollment> {
  const { data } = await apiClient.put<{ enrollment: Enrollment }>(
    `/enrollments/admin/${id}/review`,
    { decision }
  );
  return data.enrollment;
}
