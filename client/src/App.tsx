import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/ui/Layout";
import { ProtectedRoute } from "./components/ui/ProtectedRoute";
import { AdminProtectedRoute } from "./components/ui/AdminProtectedRoute";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { HomePage } from "./routes/public/HomePage";
import { LoginPage } from "./routes/public/LoginPage";
import { RegisterPage } from "./routes/public/RegisterPage";
import { ForgotPasswordPage } from "./routes/public/ForgotPasswordPage";
import { ResetPasswordPage } from "./routes/public/ResetPasswordPage";
import { CourseCatalogPage } from "./routes/public/CourseCatalogPage";
import { CourseDetailPage } from "./routes/public/CourseDetailPage";
import { CourseCheckoutPage } from "./routes/public/CourseCheckoutPage";
import { SyllabusPage } from "./routes/public/SyllabusPage";
import { AboutPage } from "./routes/public/AboutPage";
import { ContactPage } from "./routes/public/ContactPage";
import { DashboardHomePage } from "./routes/dashboard/DashboardHomePage";
import { DashboardCoursesPage } from "./routes/dashboard/DashboardCoursesPage";
import { DashboardPracticePage } from "./routes/dashboard/practice/DashboardPracticePage";
import { PracticeRunnerPage } from "./routes/dashboard/practice/PracticeRunnerPage";
import { PracticeResultPage } from "./routes/dashboard/practice/PracticeResultPage";
import { DashboardLiveExamsPage } from "./routes/dashboard/liveExams/DashboardLiveExamsPage";
import { ExamInstructionPage } from "./routes/dashboard/liveExams/ExamInstructionPage";
import { ExamInterfacePage } from "./routes/dashboard/liveExams/ExamInterfacePage";
import { ExamResultPage } from "./routes/dashboard/liveExams/ExamResultPage";
import { LeaderboardPage } from "./routes/dashboard/liveExams/LeaderboardPage";
import { CertificatePage } from "./routes/dashboard/liveExams/CertificatePage";
import { DashboardNotesPage } from "./routes/dashboard/notes/DashboardNotesPage";
import { DashboardImportantQuestionsPage } from "./routes/dashboard/importantQuestions/DashboardImportantQuestionsPage";
import { DashboardFlashcardsPage } from "./routes/dashboard/flashcards/DashboardFlashcardsPage";
import { DashboardPlannerPage } from "./routes/dashboard/planner/DashboardPlannerPage";
import { DashboardNotificationsPage } from "./routes/dashboard/notifications/DashboardNotificationsPage";
import { DashboardBookmarksPage } from "./routes/dashboard/bookmarks/DashboardBookmarksPage";
import { DashboardProfilePage } from "./routes/dashboard/profile/DashboardProfilePage";
import { DashboardProgressPage } from "./routes/dashboard/progress/DashboardProgressPage";
import { DashboardSettingsPage } from "./routes/dashboard/settings/DashboardSettingsPage";
import { AdminLoginPage } from "./routes/admin/AdminLoginPage";
import { AdminDashboardPage } from "./routes/admin/AdminDashboardPage";
import { AdminCoursesPage } from "./routes/admin/courses/AdminCoursesPage";
import { AdminCourseDetailPage } from "./routes/admin/courses/AdminCourseDetailPage";
import { AdminSubjectsPage } from "./routes/admin/subjects/AdminSubjectsPage";
import { AdminSubjectPage } from "./routes/admin/subjects/AdminSubjectPage";
import { AdminSyllabusPage } from "./routes/admin/syllabus/AdminSyllabusPage";
import { AdminCouponsPage } from "./routes/admin/coupons/AdminCouponsPage";
import { AdminHomepagePage } from "./routes/admin/homepage/AdminHomepagePage";
import { AdminEnrollmentsPage } from "./routes/admin/enrollments/AdminEnrollmentsPage";
import { AdminQuestionBankPage } from "./routes/admin/questionBank/AdminQuestionBankPage";
import { AdminQuestionSetsPage } from "./routes/admin/questionSets/AdminQuestionSetsPage";
import { AdminQuestionSetBuilderPage } from "./routes/admin/questionSets/AdminQuestionSetBuilderPage";
import { AdminBrandingPage } from "./routes/admin/branding/AdminBrandingPage";
import { AdminLiveExamsPage } from "./routes/admin/liveExams/AdminLiveExamsPage";
import { AdminLiveExamRankingsPage } from "./routes/admin/liveExams/AdminLiveExamRankingsPage";
import { AdminNotesPage } from "./routes/admin/notes/AdminNotesPage";
import { AdminImportantQuestionsPage } from "./routes/admin/importantQuestions/AdminImportantQuestionsPage";
import { AdminFlashcardsPage } from "./routes/admin/flashcards/AdminFlashcardsPage";
import { AdminNotificationsPage } from "./routes/admin/notifications/AdminNotificationsPage";
import { AdminStudentsPage } from "./routes/admin/students/AdminStudentsPage";
import { AdminAnnouncementsPage } from "./routes/admin/announcements/AdminAnnouncementsPage";
import { AdminCalendarPage } from "./routes/admin/calendar/AdminCalendarPage";
import { AdminAnalyticsPage } from "./routes/admin/analytics/AdminAnalyticsPage";
import { AdminRolesPage } from "./routes/admin/roles/AdminRolesPage";
import { AdminSecurityPage } from "./routes/admin/security/AdminSecurityPage";
import { AdminStudentDetailPage } from "./routes/admin/students/AdminStudentDetailPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="courses" element={<CourseCatalogPage />} />
        <Route path="courses/:id" element={<CourseDetailPage />} />
        <Route path="syllabus" element={<SyllabusPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="courses/:id/checkout" element={<CourseCheckoutPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHomePage />} />
          <Route path="courses" element={<DashboardCoursesPage />} />
          <Route path="practice" element={<DashboardPracticePage />} />
          <Route path="practice/:questionSetId/run" element={<PracticeRunnerPage />} />
          <Route path="practice/attempts/:attemptId" element={<PracticeResultPage />} />
          <Route path="mock-tests" element={<DashboardLiveExamsPage />} />
          <Route path="live-exams/:id/instructions" element={<ExamInstructionPage />} />
          <Route path="live-exams/:id/result/:attemptId" element={<ExamResultPage />} />
          <Route path="live-exams/:id/leaderboard" element={<LeaderboardPage />} />
          <Route path="notes" element={<DashboardNotesPage />} />
          <Route path="important-questions" element={<DashboardImportantQuestionsPage />} />
          <Route path="flashcards" element={<DashboardFlashcardsPage />} />
          <Route path="planner" element={<DashboardPlannerPage />} />
          <Route path="bookmarks" element={<DashboardBookmarksPage />} />
          <Route path="progress" element={<DashboardProgressPage />} />
          <Route path="notifications" element={<DashboardNotificationsPage />} />
          <Route path="profile" element={<DashboardProfilePage />} />
          <Route path="settings" element={<DashboardSettingsPage />} />
        </Route>
      </Route>

      {/* Exam interface and certificates run full-screen, outside the dashboard chrome */}
      <Route element={<ProtectedRoute />}>
        <Route path="dashboard/live-exams/:id/take" element={<ExamInterfacePage />} />
        <Route path="dashboard/live-exams/certificate/:attemptId" element={<CertificatePage />} />
      </Route>

      {/* Admin portal — entirely separate shell, no public site chrome */}
      <Route path="admin/login" element={<AdminLoginPage />} />
      <Route element={<AdminProtectedRoute />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="courses/:id" element={<AdminCourseDetailPage />} />
          <Route path="subjects" element={<AdminSubjectsPage />} />
          <Route path="subjects/:id" element={<AdminSubjectPage />} />
          <Route path="syllabus" element={<AdminSyllabusPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
          <Route path="homepage" element={<AdminHomepagePage />} />
          <Route path="enrollments" element={<AdminEnrollmentsPage />} />
          <Route path="question-bank" element={<AdminQuestionBankPage />} />
          <Route path="question-sets" element={<AdminQuestionSetsPage />} />
          <Route path="question-sets/:id" element={<AdminQuestionSetBuilderPage />} />
          <Route path="live-exams" element={<AdminLiveExamsPage />} />
          <Route path="live-exams/rankings" element={<AdminLiveExamRankingsPage />} />
          <Route path="branding" element={<AdminBrandingPage />} />
          <Route path="notes" element={<AdminNotesPage />} />
          <Route path="important-questions" element={<AdminImportantQuestionsPage />} />
          <Route path="flashcards" element={<AdminFlashcardsPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="students" element={<AdminStudentsPage />} />
          <Route path="students/:id" element={<AdminStudentDetailPage />} />
          <Route path="announcements" element={<AdminAnnouncementsPage />} />
          <Route path="calendar" element={<AdminCalendarPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="roles" element={<AdminRolesPage />} />
          <Route path="security" element={<AdminSecurityPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
