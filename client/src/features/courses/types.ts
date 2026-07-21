import type { Subject } from "../subjects/types";

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  isPublished: boolean;
  isFeatured: boolean;
  coverImageUrl: string | null;
  isPaid: boolean;
  price: string | null;
  paymentQrImagePath: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  _count?: { subjects: number; enrollments: number };
  subjects?: Subject[];
}

export type EnrollmentStatus = "pending" | "approved" | "rejected";

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  status: EnrollmentStatus;
  phone: string;
  paymentProofImagePath: string | null;
  couponId: number | null;
  discountedPrice: string | null;
  reviewedBy: number | null;
  reviewedAt: string | null;
  requestedAt: string;
  course: Course;
}

export interface AdminEnrollment extends Enrollment {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    college: string | null;
  };
  course: Course & { isPaid: boolean; price: string | null };
  coupon: { id: number; code: string; name: string; discountPercent: number } | null;
}

export interface CourseInput {
  title: string;
  description: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  isPaid?: boolean;
  price?: number | null;
}
