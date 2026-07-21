import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as couponsApi from "./api";
import type { CouponInput } from "./types";

export function useCoupons() {
  return useQuery({ queryKey: ["coupons"], queryFn: couponsApi.fetchCoupons });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CouponInput) => couponsApi.createCoupon(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<CouponInput & { isActive: boolean }> }) =>
      couponsApi.updateCoupon(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => couponsApi.deleteCoupon(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: ({ code, courseId }: { code: string; courseId: number }) =>
      couponsApi.validateCoupon(code, courseId),
  });
}
