import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { deleteUploadedFile, publicPathFor } from "../../middleware/upload";
import * as notificationService from "../notifications/service";
import * as auditLogService from "../auditLogs/service";
import * as couponService from "../coupons/service";

async function redeemCouponIfProvided(
  couponCode: string | undefined,
  courseId: number,
  course: { isPaid: boolean; price: unknown }
): Promise<{ couponId: number | null; discountedPrice: number | null }> {
  if (!couponCode || !course.isPaid || !course.price) {
    return { couponId: null, discountedPrice: null };
  }
  const redeemed = await couponService.redeemCouponForEnrollment(couponCode, courseId);
  const price = Number(course.price);
  const discountedPrice = Math.round((price - (price * redeemed.discountPercent) / 100) * 100) / 100;
  return { couponId: redeemed.couponId, discountedPrice };
}

export async function requestEnrollment(
  userId: number,
  courseId: number,
  phone: string,
  proofFilename?: string,
  couponCode?: string
) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.isPublished) {
    throw new ApiError(404, "Course not found");
  }

  if (course.isPaid && !proofFilename) {
    throw new ApiError(400, "Payment proof is required for a paid course");
  }

  const paymentProofImagePath = proofFilename ? publicPathFor("payment-proofs", proofFilename) : null;

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existing) {
    if (existing.status === "approved") {
      throw new ApiError(409, "You're already enrolled in this course");
    }
    if (existing.status === "pending") {
      throw new ApiError(409, "Your enrollment request is already pending review");
    }

    // Previously rejected — release its old coupon slot (if any) before resubmitting.
    if (existing.couponId) {
      await couponService.releaseCouponRedemption(existing.couponId);
    }
    const { couponId, discountedPrice } = await redeemCouponIfProvided(couponCode, courseId, course);

    // Previously rejected — allow resubmission.
    if (existing.paymentProofImagePath) {
      deleteUploadedFile(existing.paymentProofImagePath);
    }
    return prisma.enrollment.update({
      where: { id: existing.id },
      data: {
        status: "pending",
        phone,
        paymentProofImagePath,
        couponId,
        discountedPrice,
        reviewedBy: null,
        reviewedAt: null,
      },
    });
  }

  const { couponId, discountedPrice } = await redeemCouponIfProvided(couponCode, courseId, course);

  return prisma.enrollment.create({
    data: { userId, courseId, phone, paymentProofImagePath, couponId, discountedPrice },
  });
}

export async function listMyEnrollments(userId: number) {
  return prisma.enrollment.findMany({
    where: { userId },
    include: { course: true },
    orderBy: { requestedAt: "desc" },
  });
}

export async function getMyEnrollment(userId: number, courseId: number) {
  return prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } });
}

export async function isEnrolled(userId: number, courseId: number): Promise<boolean> {
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  return existing?.status === "approved";
}

export async function unenroll(userId: number, courseId: number) {
  await prisma.enrollment.deleteMany({ where: { userId, courseId } });
}

export async function listRequestsForAdmin(filters: {
  status?: "pending" | "approved" | "rejected";
  courseId?: number;
}) {
  return prisma.enrollment.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.courseId ? { courseId: filters.courseId } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, college: true } },
      course: { select: { id: true, title: true, isPaid: true, price: true } },
      coupon: { select: { id: true, code: true, name: true, discountPercent: true } },
    },
    orderBy: { requestedAt: "desc" },
  });
}

export async function countPendingRequests(courseId?: number) {
  return prisma.enrollment.count({
    where: { status: "pending", ...(courseId ? { courseId } : {}) },
  });
}

export async function reviewEnrollment(
  id: number,
  decision: "approved" | "rejected",
  adminId: number
) {
  const existing = await prisma.enrollment.findUnique({ where: { id }, include: { course: true } });
  if (!existing) throw new ApiError(404, "Enrollment request not found");
  if (existing.status !== "pending") {
    throw new ApiError(409, "This request has already been reviewed");
  }

  if (decision === "rejected" && existing.couponId) {
    await couponService.releaseCouponRedemption(existing.couponId);
  }

  const updated = await prisma.enrollment.update({
    where: { id },
    data: { status: decision, reviewedBy: adminId, reviewedAt: new Date() },
  });

  await notificationService.notify(existing.userId, {
    title:
      decision === "approved"
        ? `You're enrolled in ${existing.course.title}`
        : `Your enrollment request for ${existing.course.title} was rejected`,
    body:
      decision === "approved"
        ? "Your enrollment has been approved. You can now access all course content."
        : "Please contact support or re-submit your request if you believe this is a mistake.",
    type: decision === "approved" ? "success" : "warning",
    link: decision === "approved" ? `/dashboard/courses` : undefined,
  });

  await auditLogService.log(adminId, `enrollment.${decision}`, "enrollment", existing.id, {
    userId: existing.userId,
    courseTitle: existing.course.title,
  });

  return updated;
}
