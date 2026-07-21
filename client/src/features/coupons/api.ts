import { apiClient } from "../../lib/apiClient";
import type { Coupon, CouponInput, CouponPreview } from "./types";

export async function fetchCoupons(): Promise<Coupon[]> {
  const { data } = await apiClient.get<{ coupons: Coupon[] }>("/coupons");
  return data.coupons;
}

export async function createCoupon(input: CouponInput): Promise<Coupon> {
  const { data } = await apiClient.post<{ coupon: Coupon }>("/coupons", input);
  return data.coupon;
}

export async function updateCoupon(id: number, input: Partial<CouponInput & { isActive: boolean }>): Promise<Coupon> {
  const { data } = await apiClient.put<{ coupon: Coupon }>(`/coupons/${id}`, input);
  return data.coupon;
}

export async function deleteCoupon(id: number): Promise<void> {
  await apiClient.delete(`/coupons/${id}`);
}

export async function validateCoupon(code: string, courseId: number): Promise<CouponPreview> {
  const { data } = await apiClient.post<{ coupon: CouponPreview }>("/coupons/validate", { code, courseId });
  return data.coupon;
}
