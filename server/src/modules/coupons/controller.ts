import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as couponService from "./service";
import { createCouponSchema, updateCouponSchema, validateCouponSchema } from "./schema";

export async function list(_req: Request, res: Response) {
  const coupons = await couponService.listCoupons();
  res.json({ coupons });
}

export async function create(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const input = createCouponSchema.parse(req.body);
  const coupon = await couponService.createCoupon(input, req.user.id);
  res.status(201).json({ coupon });
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const input = updateCouponSchema.parse(req.body);
  const coupon = await couponService.updateCoupon(id, input);
  res.json({ coupon });
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  await couponService.deleteCoupon(id);
  res.status(204).send();
}

export async function validate(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const { code, courseId } = validateCouponSchema.parse(req.body);
  const result = await couponService.validateCoupon(code, courseId);
  res.json({ coupon: result });
}
