export interface CouponCourseRef {
  course: { id: number; title: string };
}

export interface Coupon {
  id: number;
  code: string;
  name: string;
  discountPercent: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  courses: CouponCourseRef[];
}

export interface CouponInput {
  code: string;
  name: string;
  discountPercent: number;
  maxUses: number | null;
  courseIds: number[];
}

export interface CouponPreview {
  couponId: number;
  code: string;
  name: string;
  discountPercent: number;
  originalPrice: number;
  discountedPrice: number;
}
