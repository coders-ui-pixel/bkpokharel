import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { UpdateStudentInput } from "./schema";

async function getStudentOrThrow(id: number) {
  const user = await db.selectFrom("users").selectAll().where("id", "=", id).executeTakeFirst();
  if (!user) throw new ApiError(404, "Student not found");
  if (user.role !== "user") throw new ApiError(400, "Cannot manage admin accounts here");
  return user;
}

export async function listStudents(filters: { search?: string; status?: "active" | "suspended" }) {
  let query = db.selectFrom("users").selectAll().where("role", "=", "user");
  if (filters.status === "active") query = query.where("isActive", "=", true);
  if (filters.status === "suspended") query = query.where("isActive", "=", false);
  if (filters.search) {
    const term = `%${filters.search}%`;
    query = query.where((eb) => eb.or([eb("name", "like", term), eb("email", "like", term)]));
  }
  const students = await query.orderBy("createdAt", "desc").execute();
  if (students.length === 0) return [];

  const ids = students.map((s) => s.id);
  const [enrollmentCounts, practiceCounts, liveExamCounts] = await Promise.all([
    db
      .selectFrom("enrollments")
      .select(["userId", (eb) => eb.fn.countAll().as("count")])
      .where("userId", "in", ids)
      .groupBy("userId")
      .execute(),
    db
      .selectFrom("practiceAttempts")
      .select(["userId", (eb) => eb.fn.countAll().as("count")])
      .where("userId", "in", ids)
      .groupBy("userId")
      .execute(),
    db
      .selectFrom("liveExamAttempts")
      .select(["userId", (eb) => eb.fn.countAll().as("count")])
      .where("userId", "in", ids)
      .groupBy("userId")
      .execute(),
  ]);
  const enrollmentByUser = new Map(enrollmentCounts.map((c) => [c.userId, Number(c.count)]));
  const practiceByUser = new Map(practiceCounts.map((c) => [c.userId, Number(c.count)]));
  const liveExamByUser = new Map(liveExamCounts.map((c) => [c.userId, Number(c.count)]));

  return students.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    college: s.college,
    isActive: s.isActive,
    createdAt: s.createdAt,
    enrollmentCount: enrollmentByUser.get(s.id) ?? 0,
    practiceAttemptCount: practiceByUser.get(s.id) ?? 0,
    liveExamAttemptCount: liveExamByUser.get(s.id) ?? 0,
  }));
}

export async function getStudentDetail(id: number) {
  const student = await getStudentOrThrow(id);

  const [enrollments, gamificationProfile] = await Promise.all([
    db
      .selectFrom("enrollments")
      .innerJoin("courses", "courses.id", "enrollments.courseId")
      .select([
        "enrollments.id as id",
        "enrollments.courseId as courseId",
        "courses.title as courseTitle",
        "enrollments.status as status",
        "enrollments.requestedAt as requestedAt",
      ])
      .where("enrollments.userId", "=", id)
      .orderBy("enrollments.requestedAt", "desc")
      .execute(),
    db.selectFrom("gamificationProfiles").selectAll().where("userId", "=", id).executeTakeFirst(),
  ]);

  return {
    id: student.id,
    name: student.name,
    email: student.email,
    phone: student.phone,
    college: student.college,
    isActive: student.isActive,
    createdAt: student.createdAt,
    enrollments,
    gamification: gamificationProfile
      ? {
          xp: gamificationProfile.xp,
          coins: gamificationProfile.coins,
          currentStreak: gamificationProfile.currentStreak,
          longestStreak: gamificationProfile.longestStreak,
        }
      : null,
  };
}

export async function updateStudent(id: number, input: UpdateStudentInput) {
  await getStudentOrThrow(id);
  await db
    .updateTable("users")
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.college !== undefined ? { college: input.college } : {}),
      updatedAt: new Date(),
    })
    .where("id", "=", id)
    .execute();
  const updated = await db.selectFrom("users").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    college: updated.college,
    isActive: updated.isActive,
    createdAt: updated.createdAt,
  };
}

export async function setSuspended(id: number, isActive: boolean) {
  await getStudentOrThrow(id);
  await db.transaction().execute(async (trx) => {
    await trx.updateTable("users").set({ isActive, updatedAt: new Date() }).where("id", "=", id).execute();
    if (!isActive) {
      await trx
        .updateTable("refreshTokens")
        .set({ revokedAt: new Date() })
        .where("userId", "=", id)
        .where("revokedAt", "is", null)
        .execute();
    }
  });
}

export async function deleteStudent(id: number) {
  await getStudentOrThrow(id);
  await db.deleteFrom("users").where("id", "=", id).execute();
}

export async function exportStudentsCsv(): Promise<string> {
  const students = await db
    .selectFrom("users")
    .selectAll()
    .where("role", "=", "user")
    .orderBy("createdAt", "desc")
    .execute();

  const header = "id,name,email,phone,college,status,joined\n";
  const rows = students.map((s) =>
    [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      s.email,
      s.phone ?? "",
      `"${(s.college ?? "").replace(/"/g, '""')}"`,
      s.isActive ? "active" : "suspended",
      s.createdAt.toISOString(),
    ].join(",")
  );
  return header + rows.join("\n");
}
