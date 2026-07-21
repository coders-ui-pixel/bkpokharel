import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { UpdateStudentInput } from "./schema";

async function getStudentOrThrow(id: number) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new ApiError(404, "Student not found");
  if (user.role !== "user") throw new ApiError(400, "Cannot manage admin accounts here");
  return user;
}

export async function listStudents(filters: { search?: string; status?: "active" | "suspended" }) {
  const students = await prisma.user.findMany({
    where: {
      role: "user",
      ...(filters.status === "active" ? { isActive: true } : {}),
      ...(filters.status === "suspended" ? { isActive: false } : {}),
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search } },
              { email: { contains: filters.search } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { enrollments: true, practiceAttempts: true, liveExamAttempts: true },
      },
    },
  });

  return students.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    college: s.college,
    isActive: s.isActive,
    createdAt: s.createdAt,
    enrollmentCount: s._count.enrollments,
    practiceAttemptCount: s._count.practiceAttempts,
    liveExamAttemptCount: s._count.liveExamAttempts,
  }));
}

export async function getStudentDetail(id: number) {
  const student = await getStudentOrThrow(id);

  const [enrollments, gamificationProfile] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: id },
      include: { course: { select: { id: true, title: true } } },
      orderBy: { requestedAt: "desc" },
    }),
    prisma.gamificationProfile.findUnique({ where: { userId: id } }),
  ]);

  return {
    id: student.id,
    name: student.name,
    email: student.email,
    phone: student.phone,
    college: student.college,
    isActive: student.isActive,
    createdAt: student.createdAt,
    enrollments: enrollments.map((e) => ({
      id: e.id,
      courseId: e.courseId,
      courseTitle: e.course.title,
      status: e.status,
      requestedAt: e.requestedAt,
    })),
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
  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.college !== undefined ? { college: input.college } : {}),
    },
  });
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
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { isActive } }),
    ...(isActive
      ? []
      : [
          prisma.refreshToken.updateMany({
            where: { userId: id, revokedAt: null },
            data: { revokedAt: new Date() },
          }),
        ]),
  ]);
}

export async function deleteStudent(id: number) {
  await getStudentOrThrow(id);
  await prisma.user.delete({ where: { id } });
}

export async function exportStudentsCsv(): Promise<string> {
  const students = await prisma.user.findMany({
    where: { role: "user" },
    orderBy: { createdAt: "desc" },
  });

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
