import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { deleteUploadedFile, publicPathFor } from "../../middleware/upload";
import * as notificationService from "../notifications/service";
import * as auditLogService from "../auditLogs/service";
import * as couponService from "../coupons/service";

function findEnrollment(userId: number, courseId: number) {
  return db.selectFrom("enrollments").selectAll().where("userId", "=", userId).where("courseId", "=", courseId).executeTakeFirst();
}

async function redeemCouponIfProvided(
  couponCode: string | undefined,
  courseId: number,
  course: { isPaid: boolean; price: string | null }
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
  const course = await db.selectFrom("courses").selectAll().where("id", "=", courseId).executeTakeFirst();
  if (!course || !course.isPublished) {
    throw new ApiError(404, "Course not found");
  }

  if (course.isPaid && !proofFilename) {
    throw new ApiError(400, "Payment proof is required for a paid course");
  }

  const paymentProofImagePath = proofFilename ? publicPathFor("payment-proofs", proofFilename) : null;

  const existing = await findEnrollment(userId, courseId);

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
    await db
      .updateTable("enrollments")
      .set({
        status: "pending",
        phone,
        paymentProofImagePath,
        couponId,
        discountedPrice: discountedPrice !== null ? String(discountedPrice) : null,
        reviewedBy: null,
        reviewedAt: null,
        updatedAt: new Date(),
      })
      .where("id", "=", existing.id)
      .execute();
    return db.selectFrom("enrollments").selectAll().where("id", "=", existing.id).executeTakeFirstOrThrow();
  }

  const { couponId, discountedPrice } = await redeemCouponIfProvided(couponCode, courseId, course);

  const result = await db
    .insertInto("enrollments")
    .values({
      userId,
      courseId,
      phone,
      paymentProofImagePath,
      couponId,
      discountedPrice: discountedPrice !== null ? String(discountedPrice) : null,
      updatedAt: new Date(),
    })
    .executeTakeFirstOrThrow();
  return db.selectFrom("enrollments").selectAll().where("id", "=", Number(result.insertId)).executeTakeFirstOrThrow();
}

export async function listMyEnrollments(userId: number) {
  return db
    .selectFrom("enrollments")
    .innerJoin("courses", "courses.id", "enrollments.courseId")
    .selectAll("enrollments")
    .select(["courses.id as courseRefId", "courses.title as courseTitle", "courses.slug as courseSlug", "courses.isPaid as courseIsPaid"])
    .where("enrollments.userId", "=", userId)
    .orderBy("enrollments.requestedAt", "desc")
    .execute()
    .then((rows) =>
      rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        courseId: r.courseId,
        status: r.status,
        phone: r.phone,
        paymentProofImagePath: r.paymentProofImagePath,
        requestedAt: r.requestedAt,
        reviewedAt: r.reviewedAt,
        reviewedBy: r.reviewedBy,
        couponId: r.couponId,
        discountedPrice: r.discountedPrice,
        updatedAt: r.updatedAt,
        course: { id: r.courseRefId, title: r.courseTitle, slug: r.courseSlug, isPaid: r.courseIsPaid },
      }))
    );
}

export async function getMyEnrollment(userId: number, courseId: number) {
  return findEnrollment(userId, courseId);
}

export async function isEnrolled(userId: number, courseId: number): Promise<boolean> {
  const existing = await findEnrollment(userId, courseId);
  return existing?.status === "approved";
}

export async function listApprovedCourseIdsForUser(userId: number): Promise<number[]> {
  const rows = await db
    .selectFrom("enrollments")
    .select("courseId")
    .where("userId", "=", userId)
    .where("status", "=", "approved")
    .execute();
  return rows.map((r) => r.courseId);
}

export async function unenroll(userId: number, courseId: number) {
  await db.deleteFrom("enrollments").where("userId", "=", userId).where("courseId", "=", courseId).execute();
}

export async function listRequestsForAdmin(filters: { status?: "pending" | "approved" | "rejected"; courseId?: number }) {
  const rows = await db
    .selectFrom("enrollments")
    .innerJoin("users", "users.id", "enrollments.userId")
    .innerJoin("courses", "courses.id", "enrollments.courseId")
    .leftJoin("coupons", "coupons.id", "enrollments.couponId")
    .selectAll("enrollments")
    .select([
      "users.id as userRefId",
      "users.name as userName",
      "users.email as userEmail",
      "users.phone as userPhone",
      "users.college as userCollege",
      "courses.id as courseRefId",
      "courses.title as courseTitle",
      "courses.isPaid as courseIsPaid",
      "courses.price as coursePrice",
      "coupons.id as couponRefId",
      "coupons.code as couponCode",
      "coupons.name as couponName",
      "coupons.discountPercent as couponDiscountPercent",
    ])
    .$if(filters.status !== undefined, (qb) => qb.where("enrollments.status", "=", filters.status as "pending" | "approved" | "rejected"))
    .$if(filters.courseId !== undefined, (qb) => qb.where("enrollments.courseId", "=", filters.courseId as number))
    .orderBy("enrollments.requestedAt", "desc")
    .execute();

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    courseId: r.courseId,
    status: r.status,
    phone: r.phone,
    paymentProofImagePath: r.paymentProofImagePath,
    requestedAt: r.requestedAt,
    reviewedAt: r.reviewedAt,
    reviewedBy: r.reviewedBy,
    couponId: r.couponId,
    discountedPrice: r.discountedPrice,
    updatedAt: r.updatedAt,
    user: { id: r.userRefId, name: r.userName, email: r.userEmail, phone: r.userPhone, college: r.userCollege },
    course: { id: r.courseRefId, title: r.courseTitle, isPaid: r.courseIsPaid, price: r.coursePrice },
    coupon:
      r.couponRefId !== null
        ? { id: r.couponRefId, code: r.couponCode, name: r.couponName, discountPercent: r.couponDiscountPercent }
        : null,
  }));
}

export async function countPendingRequests(courseId?: number) {
  const row = await db
    .selectFrom("enrollments")
    .select((eb) => eb.fn.countAll().as("count"))
    .where("status", "=", "pending")
    .$if(courseId !== undefined, (qb) => qb.where("courseId", "=", courseId as number))
    .executeTakeFirstOrThrow();
  return Number(row.count);
}

export async function reviewEnrollment(id: number, decision: "approved" | "rejected", adminId: number) {
  const existing = await db
    .selectFrom("enrollments")
    .innerJoin("courses", "courses.id", "enrollments.courseId")
    .selectAll("enrollments")
    .select(["courses.title as courseTitle"])
    .where("enrollments.id", "=", id)
    .executeTakeFirst();
  if (!existing) throw new ApiError(404, "Enrollment request not found");
  if (existing.status !== "pending") {
    throw new ApiError(409, "This request has already been reviewed");
  }

  if (decision === "rejected" && existing.couponId) {
    await couponService.releaseCouponRedemption(existing.couponId);
  }

  await db
    .updateTable("enrollments")
    .set({ status: decision, reviewedBy: adminId, reviewedAt: new Date(), updatedAt: new Date() })
    .where("id", "=", id)
    .execute();
  const updated = await db.selectFrom("enrollments").selectAll().where("id", "=", id).executeTakeFirstOrThrow();

  await notificationService.notify(existing.userId, {
    title:
      decision === "approved"
        ? `You're enrolled in ${existing.courseTitle}`
        : `Your enrollment request for ${existing.courseTitle} was rejected`,
    body:
      decision === "approved"
        ? "Your enrollment has been approved. You can now access all course content."
        : "Please contact support or re-submit your request if you believe this is a mistake.",
    type: decision === "approved" ? "success" : "warning",
    link: decision === "approved" ? `/dashboard/courses` : undefined,
  });

  await auditLogService.log(adminId, `enrollment.${decision}`, "enrollment", existing.id, {
    userId: existing.userId,
    courseTitle: existing.courseTitle,
  });

  return updated;
}
