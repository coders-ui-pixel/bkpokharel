import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/routes";
import { courseRouter } from "./modules/courses/routes";
import { enrollmentRouter } from "./modules/enrollments/routes";
import { homepageRouter } from "./modules/homepage/routes";
import { contactRouter } from "./modules/contact/routes";
import { questionBankRouter } from "./modules/questionBank/routes";
import { questionSetRouter } from "./modules/questionSets/routes";
import { attemptRouter } from "./modules/attempts/routes";
import { adminStatsRouter } from "./modules/adminStats/routes";
import { subjectDetailRouter } from "./modules/subjects/routes";
import { liveExamRouter } from "./modules/liveExams/routes";
import { liveExamAttemptRouter } from "./modules/liveExamAttempts/routes";
import { siteSettingsRouter } from "./modules/siteSettings/routes";
import { noteRouter } from "./modules/notes/routes";
import { importantQuestionRouter } from "./modules/importantQuestions/routes";
import { flashcardChapterRouter, flashcardRouter } from "./modules/flashcards/routes";
import { studyPlannerRouter } from "./modules/studyPlanner/routes";
import { notificationRouter } from "./modules/notifications/routes";
import { bookmarkRouter } from "./modules/bookmarks/routes";
import { gamificationRouter } from "./modules/gamification/routes";
import { studentRouter } from "./modules/students/routes";
import { announcementRouter } from "./modules/announcements/routes";
import { calendarEventRouter } from "./modules/calendarEvents/routes";
import { analyticsRouter } from "./modules/analytics/routes";
import { adminAccountRouter } from "./modules/adminAccounts/routes";
import { auditLogRouter } from "./modules/auditLogs/routes";
import { twoFactorRouter } from "./modules/twoFactor/routes";
import { couponRouter } from "./modules/coupons/routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
    // pdf.js streams PDFs using HTTP Range requests and needs to read these response
    // headers to detect range support and validate partial responses; without exposing
    // them across origins, the browser hides them from JS and pdf.js can end up only
    // able to parse the first page of a multi-page PDF.
    exposedHeaders: ["Content-Length", "Content-Range", "Accept-Ranges", "Content-Disposition"],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(env.UPLOAD_DIR));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/courses", courseRouter);
app.use("/api/enrollments", enrollmentRouter);
app.use("/api/homepage", homepageRouter);
app.use("/api/contact", contactRouter);
app.use("/api/question-bank", questionBankRouter);
app.use("/api/question-sets", questionSetRouter);
app.use("/api/attempts", attemptRouter);
app.use("/api/admin/stats", adminStatsRouter);
app.use("/api/subjects", subjectDetailRouter);
app.use("/api/live-exams", liveExamRouter);
app.use("/api/live-exams", liveExamAttemptRouter);
app.use("/api/site-settings", siteSettingsRouter);
app.use("/api/chapters/:chapterId/notes", noteRouter);
app.use("/api/chapters/:chapterId/important-questions", importantQuestionRouter);
app.use("/api/chapters/:chapterId/flashcards", flashcardChapterRouter);
app.use("/api/flashcards", flashcardRouter);
app.use("/api/study-tasks", studyPlannerRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/bookmarks", bookmarkRouter);
app.use("/api/gamification", gamificationRouter);
app.use("/api/admin/students", studentRouter);
app.use("/api/announcements", announcementRouter);
app.use("/api/calendar-events", calendarEventRouter);
app.use("/api/admin/analytics", analyticsRouter);
app.use("/api/admin/admins", adminAccountRouter);
app.use("/api/admin/audit-logs", auditLogRouter);
app.use("/api/auth/2fa", twoFactorRouter);
app.use("/api/coupons", couponRouter);

app.use(notFoundHandler);
app.use(errorHandler);
