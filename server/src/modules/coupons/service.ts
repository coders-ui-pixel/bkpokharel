import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { CreateCouponInput, UpdateCouponInput } from "./schema";

export async function listCoupons() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      courses: { include: { course: { select: { id: true, title: true } } } },
    },
  });
}

export async function createCoupon(input: CreateCouponInput, adminId: number) {
  const existing = await prisma.coupon.findUnique({ where: { code: input.code } });
  if (existing) throw new ApiError(409, "A coupon with this code already exists");

  return prisma.coupon.create({
    data: {
      code: input.code,
      name: input.name,
      discountPercent: input.discountPercent,
      maxUses: input.maxUses ?? null,
      createdBy: adminId,
      courses: { create: input.courseIds.map((courseId) => ({ courseId })) },
    },
    include: { courses: { include: { course: { select: { id: true, title: true } } } } },
  });
}

export async function updateCoupon(id: number, input: UpdateCouponInput) {
  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Coupon not found");

  return prisma.coupon.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.discountPercent !== undefined ? { discountPercent: input.discountPercent } : {}),
      ...(input.maxUses !== undefined ? { maxUses: input.maxUses } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.courseIds !== undefined
        ? { courses: { deleteMany: {}, create: input.courseIds.map((courseId) => ({ courseId })) } }
        : {}),
    },
    include: { courses: { include: { course: { select: { id: true, title: true } } } } },
  });
}

export async function deleteCoupon(id: number) {
  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Coupon not found");
  await prisma.coupon.delete({ where: { id } });
}

interface CouponPreview {
  couponId: number;
  code: string;
  name: string;
  discountPercent: number;
}

async function findRedeemableCoupon(code: string, courseId: number): Promise<CouponPreview> {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: { courses: { select: { courseId: true } } },
  });

  if (!coupon || !coupon.isActive) {
    throw new ApiError(404, "This coupon code is not valid");
  }
  if (!coupon.courses.some((c) => c.courseId === courseId)) {
    throw new ApiError(400, "This coupon code doesn't apply to this course");
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new ApiError(400, "This coupon code has reached its usage limit");
  }

  return {
    couponId: coupon.id,
    code: coupon.code,
    name: coupon.name,
    discountPercent: coupon.discountPercent,
  };
}

export async function validateCoupon(code: string, courseId: number) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new ApiError(404, "Course not found");
  if (!course.isPaid || !course.price) {
    throw new ApiError(400, "Coupons only apply to paid courses");
  }

  const preview = await findRedeemableCoupon(code, courseId);
  const price = Number(course.price);
  const discountedPrice = Math.round((price - (price * preview.discountPercent) / 100) * 100) / 100;

  return { ...preview, originalPrice: price, discountedPrice };
}

/**
 * Re-validates the coupon and atomically increments its usage count. Used at the point of
 * enrollment submission (not at preview/validate time) so usedCount reflects real redemptions,
 * not every time a student checks whether a code works.
 */
export async function redeemCouponForEnrollment(code: string, courseId: number) {
  return prisma.$transaction(async (tx) => {
    const coupon = await tx.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: { courses: { select: { courseId: true } } },
    });
    if (!coupon || !coupon.isActive) throw new ApiError(404, "This coupon code is not valid");
    if (!coupon.courses.some((c) => c.courseId === courseId)) {
      throw new ApiError(400, "This coupon code doesn't apply to this course");
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      throw new ApiError(400, "This coupon code has reached its usage limit");
    }

    const updated = await tx.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } },
    });

    return { couponId: updated.id, discountPercent: updated.discountPercent };
  });
}

export async function releaseCouponRedemption(couponId: number) {
  await prisma.coupon.update({
    where: { id: couponId },
    data: { usedCount: { decrement: 1 } },
  });
}
