import { prisma } from "../../config/db";

export async function getOverview() {
  const [
    totalStudents,
    totalCourses,
    publishedCourses,
    approvedEnrollments,
    pendingEnrollments,
    rejectedEnrollments,
    totalQuestions,
    totalQuestionSets,
    contactMessages,
    recentContactMessages,
    recentEnrollments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "user" } }),
    prisma.course.count(),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.enrollment.count({ where: { status: "approved" } }),
    prisma.enrollment.count({ where: { status: "pending" } }),
    prisma.enrollment.count({ where: { status: "rejected" } }),
    prisma.question.count({ where: { isActive: true } }),
    prisma.questionSet.count(),
    prisma.contactMessage.count(),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.enrollment.findMany({
      orderBy: { requestedAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    }),
  ]);

  return {
    totalStudents,
    totalCourses,
    publishedCourses,
    approvedEnrollments,
    pendingEnrollments,
    rejectedEnrollments,
    totalQuestions,
    totalQuestionSets,
    contactMessages,
    recentContactMessages,
    recentEnrollments,
  };
}
