import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useMyEnrollments } from "../../features/courses/hooks";
import { useSelectedCourse } from "../../context/SelectedCourseContext";
import { useMyAttempts } from "../../features/attempts/hooks";
import { useGamificationProfile } from "../../features/gamification/hooks";
import { useLiveExams } from "../../features/liveExams/hooks";
import { useBookmarks } from "../../features/bookmarks/hooks";
import { AcademicCalendar } from "../../components/dashboard/AcademicCalendar";
import { DashboardHeroBanner } from "../../components/dashboard/DashboardHeroBanner";
import { AnimatedCounter } from "../../components/dashboard/AnimatedCounter";
import { CircularProgress } from "../../components/dashboard/CircularProgress";
import { SidebarIcon } from "../../components/dashboard/SidebarIcon";
import { LaptopQuizIllustration } from "../../components/illustrations/LaptopQuizIllustration";
import { getRecentNotes } from "../../lib/recentNotes";

const QUICK_ACTIONS = [
  { to: "/dashboard/practice", label: "MCQ Practice", icon: "practice" as const },
  { to: "/dashboard/mock-tests", label: "Mock Tests", icon: "mockTests" as const },
  { to: "/dashboard/notes", label: "Study Notes", icon: "notes" as const },
  { to: "/dashboard/flashcards", label: "Flash Cards", icon: "flashcards" as const },
  { to: "/dashboard/planner", label: "Study Planner", icon: "planner" as const },
  { to: "/dashboard/bookmarks", label: "Bookmarks", icon: "bookmarks" as const },
];

export function DashboardHomePage() {
  const { user } = useAuth();
  const { data: enrollments } = useMyEnrollments();
  const { data: attempts } = useMyAttempts();
  const { data: gamification } = useGamificationProfile();
  const { data: liveExams } = useLiveExams();
  const { data: bookmarks } = useBookmarks();

  const { selectedCourseId, setSelectedCourseId } = useSelectedCourse();

  useEffect(() => {
    if (!enrollments || enrollments.length === 0) return;
    if (selectedCourseId === null || !enrollments.some((e) => e.courseId === selectedCourseId)) {
      setSelectedCourseId(enrollments[0].courseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollments]);

  const selectedCourse = enrollments?.find((e) => e.courseId === selectedCourseId)?.course;
  const continueLink = selectedCourse ? `/courses/${selectedCourse.id}` : "/dashboard/courses";

  const submittedAttempts = attempts?.filter((a) => a.status === "submitted") ?? [];
  const avgScorePercent = submittedAttempts.length
    ? submittedAttempts.reduce((sum, a) => sum + (Number(a.score ?? 0) / Number(a.totalMarks)) * 100, 0) /
      submittedAttempts.length
    : 0;
  const recentAttempts = submittedAttempts.slice(0, 5);
  const recentNotes = getRecentNotes();

  const upcomingExam = useMemo(() => {
    const relevant = (liveExams ?? []).filter((e) => e.status === "live" || e.status === "scheduled");
    return relevant.sort((a, b) => {
      if (a.status !== b.status) return a.status === "live" ? -1 : 1;
      return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    })[0];
  }, [liveExams]);

  const earnedBadges = gamification?.badges.filter((b) => b.earned) ?? [];

  const stats = [
    { label: "Total Courses", value: enrollments?.length ?? 0 },
    { label: "Practice Attempts", value: attempts?.length ?? 0 },
    { label: "Current Streak", value: gamification?.currentStreak ?? 0, suffix: " days" },
    { label: "Rank", value: gamification?.rank ?? 0, display: gamification ? `#${gamification.rank}` : "Unranked" },
    { label: "XP Points", value: gamification?.xp ?? 0 },
  ];

  return (
    <div className="dash-home">
      <div className="dash-home__top">
        <DashboardHeroBanner>
          <div>
            <span className="eyebrow">Welcome back</span>
            <h1>Good to see you, {user?.name?.split(" ")[0]}.</h1>

            <p>
              {selectedCourse
                ? `Continue your preparation in ${selectedCourse.title}.`
                : "Continue your preparation right where you left off."}
            </p>
            <Link to={continueLink} className="btn btn--primary">
              Continue Learning →
            </Link>
          </div>
          <motion.div
            className="dash-hero-card__art"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <LaptopQuizIllustration className="illustration" />
          </motion.div>
        </DashboardHeroBanner>

        <div className="dash-home__side">
          {enrollments && enrollments.length > 1 && (
            <div className="dash-home__course-switch">
              <select
                value={selectedCourseId ?? ""}
                onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                aria-label="Switch course"
              >
                {enrollments.map((e) => (
                  <option key={e.courseId} value={e.courseId}>
                    📘 {e.course.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <AcademicCalendar />
        </div>
      </div>

      <div className="dash-quick-actions">
        {QUICK_ACTIONS.map((action, i) => (
          <motion.div
            key={action.to}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
          >
            <Link to={action.to} className="dash-quick-action">
              <SidebarIcon name={action.icon} />
              <span>{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {enrollments && enrollments.length > 0 && (
        <div className="dash-section">
          <div className="dash-section__header">
            <h2>My Courses</h2>
            <Link to="/dashboard/courses">View all →</Link>
          </div>
          <div className="dash-mini-course-grid">
            {enrollments.slice(0, 3).map(({ course }) => (
              <Link key={course.id} to={`/courses/${course.id}`} className="dash-mini-course-card">
                <strong>{course.title}</strong>
                <span className="course-meta">{course.description}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="dash-meters-row">
        <CircularProgress percent={avgScorePercent} label="Avg. score" />
        <CircularProgress percent={0} label={selectedCourse ? `${selectedCourse.title} completion` : "Course completion"} />
        <div className="dash-stats-grid dash-stats-grid--compact">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="dash-stat-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <strong>
                {"display" in stat && stat.display ? (
                  stat.display
                ) : (
                  <AnimatedCounter value={stat.value} suffix={stat.suffix ?? ""} />
                )}
              </strong>
              <span>{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="dash-activity-grid">
        <div className="dash-activity-card">
          <div className="dash-activity-card__header">
            <h2>Latest MCQ attempts</h2>
            <Link to="/dashboard/practice">Practice more →</Link>
          </div>
          {recentAttempts.length === 0 && (
            <p className="course-meta">No attempts yet — take a chapter-wise practice set to get started.</p>
          )}
          <ul className="dash-activity-list">
            {recentAttempts.map((a) => (
              <li key={a.id}>
                <Link to={`/dashboard/practice/attempts/${a.id}`}>
                  <strong>{a.questionSet.title}</strong>
                  <span className="course-meta">
                    {a.score}/{a.totalMarks} · {new Date(a.startedAt).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="dash-activity-card">
          <div className="dash-activity-card__header">
            <h2>Continue reading notes</h2>
            <Link to="/dashboard/notes">Browse all notes →</Link>
          </div>
          {recentNotes.length === 0 && (
            <p className="course-meta">No notes opened yet — open a chapter's notes to see it here.</p>
          )}
          <ul className="dash-activity-list">
            {recentNotes.map((note) => (
              <li key={note.id}>
                <Link to={`/dashboard/notes?openNoteId=${note.id}`}>
                  <strong>{note.title}</strong>
                  <span className="course-meta">
                    Last opened {new Date(note.openedAt).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="dash-activity-card">
          <div className="dash-activity-card__header">
            <h2>Up next</h2>
            <Link to="/dashboard/mock-tests">All mock tests →</Link>
          </div>
          {!upcomingExam && (
            <p className="course-meta">No live exams scheduled right now — check back soon.</p>
          )}
          {upcomingExam && (
            <Link
              to={`/dashboard/live-exams/${upcomingExam.id}/instructions`}
              className="dash-upcoming-exam"
            >
              <span className={`badge ${upcomingExam.status === "live" ? "badge--pending" : ""}`}>
                {upcomingExam.status === "live" ? "Live now" : "Upcoming"}
              </span>
              <strong>{upcomingExam.title}</strong>
              <span className="course-meta">
                {upcomingExam.course?.title ?? "All courses"} ·{" "}
                {new Date(upcomingExam.startsAt).toLocaleString()}
              </span>
            </Link>
          )}
        </div>

        <div className="dash-activity-card">
          <div className="dash-activity-card__header">
            <h2>Achievements</h2>
            <Link to="/dashboard/progress">View all →</Link>
          </div>
          {earnedBadges.length === 0 && (
            <p className="course-meta">
              No badges yet — complete a practice set or mock test to earn your first one.
            </p>
          )}
          {earnedBadges.length > 0 && (
            <div className="dash-badge-strip">
              {earnedBadges.slice(0, 6).map((b) => (
                <span key={b.key} className="dash-badge-strip__item" title={b.description}>
                  <span className="dash-badge-strip__icon">{b.icon}</span>
                  {b.label}
                </span>
              ))}
            </div>
          )}
          <p className="course-meta" style={{ marginTop: 10 }}>
            {gamification?.xp ?? 0} XP · {bookmarks?.length ?? 0} bookmarks saved
          </p>
        </div>
      </div>
    </div>
  );
}
