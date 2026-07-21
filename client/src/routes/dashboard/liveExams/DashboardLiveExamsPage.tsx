import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useLiveExams } from "../../../features/liveExams/hooks";
import type { LiveExam } from "../../../features/liveExams/types";

function formatWindow(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const sameDay = start.toDateString() === end.toDateString();
  const dateFmt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const timeFmt: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  if (sameDay) {
    return `${start.toLocaleDateString(undefined, dateFmt)} · ${start.toLocaleTimeString(undefined, timeFmt)} – ${end.toLocaleTimeString(undefined, timeFmt)}`;
  }
  return `${start.toLocaleDateString(undefined, dateFmt)} → ${end.toLocaleDateString(undefined, dateFmt)}`;
}

function ExamCard({ exam, index }: { exam: LiveExam; index: number }) {
  return (
    <motion.div
      className={`exam-card exam-card--${exam.status}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -4 }}
    >
      {exam.status === "live" && (
        <div className="exam-card__live-tag">
          <span className="exam-card__live-dot" />
          Live now
        </div>
      )}
      {exam.status === "scheduled" && <div className="exam-card__tag">Upcoming</div>}
      {exam.status === "completed" && <div className="exam-card__tag exam-card__tag--muted">Completed</div>}

      <h3 className="exam-card__title">{exam.title}</h3>
      <p className="exam-card__course">{exam.course?.title ?? "All courses"}</p>

      <div className="exam-card__meta">
        <span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
          </svg>
          {exam.questionSet._count?.items ?? 0} questions
        </span>
        <span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="4" width="18" height="17" rx="2" />
            <path d="M3 9h18M8 2v4M16 2v4" strokeLinecap="round" />
          </svg>
          {formatWindow(exam.startsAt, exam.endsAt)}
        </span>
      </div>

      {(exam.status === "live" || exam.status === "scheduled") && (
        <Link
          to={`/dashboard/live-exams/${exam.id}/instructions`}
          className={`exam-card__cta ${exam.status === "live" ? "exam-card__cta--live" : ""}`}
        >
          {exam.status === "live" ? "Join now →" : "View instructions →"}
        </Link>
      )}
      {exam.status === "completed" && (
        <Link to={`/dashboard/live-exams/${exam.id}/instructions`} className="exam-card__cta exam-card__cta--ghost">
          View leaderboard →
        </Link>
      )}
    </motion.div>
  );
}

export function DashboardLiveExamsPage() {
  const { data: exams, isLoading } = useLiveExams();

  const groups = useMemo(() => {
    const active = (exams ?? []).filter((e) => e.status !== "cancelled");
    return {
      live: active.filter((e) => e.status === "live"),
      scheduled: active
        .filter((e) => e.status === "scheduled")
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
      completed: active
        .filter((e) => e.status === "completed")
        .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()),
    };
  }, [exams]);

  const totalUpcoming = groups.live.length + groups.scheduled.length;

  return (
    <section className="practice-page">
      <div className="practice-hero practice-hero--exams">
        <div className="practice-hero__icon">⏱</div>
        <div className="practice-hero__body">
          <h1>Mock Tests &amp; Live Exams</h1>
          <p>Scheduled exams run on a synced server timer — join once the exam goes live.</p>
        </div>
        {exams && exams.length > 0 && (
          <div className="practice-hero__stats">
            <div>
              <strong>{groups.live.length}</strong>
              <span>Live now</span>
            </div>
            <div>
              <strong>{totalUpcoming}</strong>
              <span>Upcoming</span>
            </div>
            <div>
              <strong>{groups.completed.length}</strong>
              <span>Completed</span>
            </div>
          </div>
        )}
      </div>

      {isLoading && <p>Loading...</p>}

      {!isLoading && exams?.length === 0 && (
        <div className="practice-empty-card">
          <span className="practice-empty-card__icon">🗓</span>
          <p>No live exams scheduled yet — check back soon.</p>
        </div>
      )}

      {groups.live.length > 0 && (
        <div className="practice-subject-block">
          <div className="practice-subject-block__header">
            <span className="practice-subject-block__avatar practice-subject-block__avatar--live">●</span>
            <h2>Live now</h2>
          </div>
          <div className="practice-card-grid">
            {groups.live.map((exam, i) => (
              <ExamCard key={exam.id} exam={exam} index={i} />
            ))}
          </div>
        </div>
      )}

      {groups.scheduled.length > 0 && (
        <div className="practice-subject-block">
          <div className="practice-subject-block__header">
            <span className="practice-subject-block__avatar">📅</span>
            <h2>Upcoming</h2>
          </div>
          <div className="practice-card-grid">
            {groups.scheduled.map((exam, i) => (
              <ExamCard key={exam.id} exam={exam} index={i} />
            ))}
          </div>
        </div>
      )}

      {groups.completed.length > 0 && (
        <div className="practice-subject-block">
          <div className="practice-subject-block__header">
            <span className="practice-subject-block__avatar">✓</span>
            <h2>Completed</h2>
          </div>
          <div className="practice-card-grid">
            {groups.completed.map((exam, i) => (
              <ExamCard key={exam.id} exam={exam} index={i} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
