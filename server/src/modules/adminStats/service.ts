import { db } from "../../config/db";

async function count(query: { executeTakeFirstOrThrow: () => Promise<{ count: string | number | bigint }> }) {
  const row = await query.executeTakeFirstOrThrow();
  return Number(row.count);
}

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
    count(db.selectFrom("users").select((eb) => eb.fn.countAll().as("count")).where("role", "=", "user")),
    count(db.selectFrom("courses").select((eb) => eb.fn.countAll().as("count"))),
    count(db.selectFrom("courses").select((eb) => eb.fn.countAll().as("count")).where("isPublished", "=", true)),
    count(db.selectFrom("enrollments").select((eb) => eb.fn.countAll().as("count")).where("status", "=", "approved")),
    count(db.selectFrom("enrollments").select((eb) => eb.fn.countAll().as("count")).where("status", "=", "pending")),
    count(db.selectFrom("enrollments").select((eb) => eb.fn.countAll().as("count")).where("status", "=", "rejected")),
    count(db.selectFrom("questions").select((eb) => eb.fn.countAll().as("count")).where("isActive", "=", true)),
    count(db.selectFrom("questionSets").select((eb) => eb.fn.countAll().as("count"))),
    count(db.selectFrom("contactMessages").select((eb) => eb.fn.countAll().as("count"))),
    db.selectFrom("contactMessages").selectAll().orderBy("createdAt", "desc").limit(5).execute(),
    db
      .selectFrom("enrollments")
      .innerJoin("users", "users.id", "enrollments.userId")
      .innerJoin("courses", "courses.id", "enrollments.courseId")
      .select([
        "enrollments.id as id",
        "enrollments.status as status",
        "enrollments.requestedAt as requestedAt",
        "users.name as userName",
        "users.email as userEmail",
        "courses.title as courseTitle",
      ])
      .orderBy("enrollments.requestedAt", "desc")
      .limit(5)
      .execute(),
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
    recentEnrollments: recentEnrollments.map((e) => ({
      id: e.id,
      status: e.status,
      requestedAt: e.requestedAt,
      user: { name: e.userName, email: e.userEmail },
      course: { title: e.courseTitle },
    })),
  };
}
