import { sql } from "kysely";
import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { CreateCouponInput, UpdateCouponInput } from "./schema";

async function getCouponWithCourses(id: number) {
  const coupon = await db.selectFrom("coupons").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
  const courseLinks = await db
    .selectFrom("couponCourses")
    .innerJoin("courses", "courses.id", "couponCourses.courseId")
    .select(["couponCourses.id as linkId", "courses.id as courseId", "courses.title as courseTitle"])
    .where("couponCourses.couponId", "=", id)
    .execute();
  return {
    ...coupon,
    courses: courseLinks.map((l) => ({ id: l.linkId, courseId: l.courseId, course: { id: l.courseId, title: l.courseTitle } })),
  };
}

export async function listCoupons() {
  const coupons = await db.selectFrom("coupons").selectAll().orderBy("createdAt", "desc").execute();
  if (coupons.length === 0) return [];

  const couponIds = coupons.map((c) => c.id);
  const courseLinks = await db
    .selectFrom("couponCourses")
    .innerJoin("courses", "courses.id", "couponCourses.courseId")
    .select([
      "couponCourses.id as linkId",
      "couponCourses.couponId as couponId",
      "courses.id as courseId",
      "courses.title as courseTitle",
    ])
    .where("couponCourses.couponId", "in", couponIds)
    .execute();

  const linksByCoupon = new Map<number, { id: number; courseId: number; course: { id: number; title: string } }[]>();
  for (const link of courseLinks) {
    const list = linksByCoupon.get(link.couponId) ?? [];
    list.push({ id: link.linkId, courseId: link.courseId, course: { id: link.courseId, title: link.courseTitle } });
    linksByCoupon.set(link.couponId, list);
  }

  return coupons.map((c) => ({ ...c, courses: linksByCoupon.get(c.id) ?? [] }));
}

export async function createCoupon(input: CreateCouponInput, adminId: number) {
  const existing = await db.selectFrom("coupons").select("id").where("code", "=", input.code).executeTakeFirst();
  if (existing) throw new ApiError(409, "A coupon with this code already exists");

  const couponId = await db.transaction().execute(async (trx) => {
    const result = await trx
      .insertInto("coupons")
      .values({
        code: input.code,
        name: input.name,
        discountPercent: input.discountPercent,
        maxUses: input.maxUses ?? null,
        createdBy: adminId,
        updatedAt: new Date(),
      })
      .executeTakeFirstOrThrow();
    const id = Number(result.insertId);
    await trx
      .insertInto("couponCourses")
      .values(input.courseIds.map((courseId) => ({ couponId: id, courseId })))
      .execute();
    return id;
  });

  return getCouponWithCourses(couponId);
}

export async function updateCoupon(id: number, input: UpdateCouponInput) {
  const existing = await db.selectFrom("coupons").select("id").where("id", "=", id).executeTakeFirst();
  if (!existing) throw new ApiError(404, "Coupon not found");

  await db.transaction().execute(async (trx) => {
    await trx
      .updateTable("coupons")
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.discountPercent !== undefined ? { discountPercent: input.discountPercent } : {}),
        ...(input.maxUses !== undefined ? { maxUses: input.maxUses } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        updatedAt: new Date(),
      })
      .where("id", "=", id)
      .execute();

    if (input.courseIds !== undefined) {
      await trx.deleteFrom("couponCourses").where("couponId", "=", id).execute();
      await trx
        .insertInto("couponCourses")
        .values(input.courseIds.map((courseId) => ({ couponId: id, courseId })))
        .execute();
    }
  });

  return getCouponWithCourses(id);
}

export async function deleteCoupon(id: number) {
  const existing = await db.selectFrom("coupons").select("id").where("id", "=", id).executeTakeFirst();
  if (!existing) throw new ApiError(404, "Coupon not found");
  await db.deleteFrom("coupons").where("id", "=", id).execute();
}

interface CouponPreview {
  couponId: number;
  code: string;
  name: string;
  discountPercent: number;
}

async function findRedeemableCoupon(code: string, courseId: number): Promise<CouponPreview> {
  const coupon = await db
    .selectFrom("coupons")
    .selectAll()
    .where("code", "=", code.trim().toUpperCase())
    .executeTakeFirst();

  if (!coupon || !coupon.isActive) {
    throw new ApiError(404, "This coupon code is not valid");
  }

  const association = await db
    .selectFrom("couponCourses")
    .select("id")
    .where("couponId", "=", coupon.id)
    .where("courseId", "=", courseId)
    .executeTakeFirst();
  if (!association) {
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
  const course = await db.selectFrom("courses").selectAll().where("id", "=", courseId).executeTakeFirst();
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
 *
 * The final UPDATE is a single atomic conditional statement (re-checking isActive and the
 * maxUses floor in the WHERE clause itself) so two concurrent redemptions near the limit can't
 * both read-then-write past maxUses.
 */
export async function redeemCouponForEnrollment(code: string, courseId: number) {
  return db.transaction().execute(async (trx) => {
    const coupon = await trx
      .selectFrom("coupons")
      .selectAll()
      .where("code", "=", code.trim().toUpperCase())
      .executeTakeFirst();
    if (!coupon || !coupon.isActive) throw new ApiError(404, "This coupon code is not valid");

    const association = await trx
      .selectFrom("couponCourses")
      .select("id")
      .where("couponId", "=", coupon.id)
      .where("courseId", "=", courseId)
      .executeTakeFirst();
    if (!association) throw new ApiError(400, "This coupon code doesn't apply to this course");

    const result = await trx
      .updateTable("coupons")
      .set({ usedCount: sql`used_count + 1`, updatedAt: new Date() })
      .where("id", "=", coupon.id)
      .where("isActive", "=", true)
      .where((eb) => eb.or([eb("maxUses", "is", null), eb("usedCount", "<", eb.ref("maxUses"))]))
      .executeTakeFirst();
    if (result.numUpdatedRows === 0n) {
      throw new ApiError(400, "This coupon code has reached its usage limit");
    }

    return { couponId: coupon.id, discountPercent: coupon.discountPercent };
  });
}

export async function releaseCouponRedemption(couponId: number) {
  await db
    .updateTable("coupons")
    .set({ usedCount: sql`used_count - 1`, updatedAt: new Date() })
    .where("id", "=", couponId)
    .where("usedCount", ">", 0)
    .execute();
}
