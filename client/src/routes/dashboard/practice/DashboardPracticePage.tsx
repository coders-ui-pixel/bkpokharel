import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useMyEnrollments } from "../../../features/courses/hooks";
import { useQuestionSets } from "../../../features/questionSets/hooks";
import { useMyAttempts } from "../../../features/attempts/hooks";
import { useSelectedCourse } from "../../../context/SelectedCourseContext";
import type { QuestionSet } from "../../../features/questionSets/types";

interface ChapterGroup {
  chapterId: number | null;
  chapterTitle: string;
  sets: QuestionSet[];
}

interface SubjectGroup {
  subjectId: number | null;
  subjectTitle: string;
  chapters: ChapterGroup[];
}

const DIFFICULTY_META: Record<string, { label: string; className: string }> = {
  easy: { label: "Easy", className: "diff--easy" },
  medium: { label: "Medium", className: "diff--medium" },
  hard: { label: "Hard", className: "diff--hard" },
  mixed: { label: "Mixed", className: "diff--mixed" },
};

function groupSets(sets: QuestionSet[]): SubjectGroup[] {
  const subjectMap = new Map<string, SubjectGroup>();

  for (const set of sets) {
    const subjectKey = set.subject ? String(set.subject.id) : "none";
    if (!subjectMap.has(subjectKey)) {
      subjectMap.set(subjectKey, {
        subjectId: set.subject?.id ?? null,
        subjectTitle: set.subject?.title ?? "General",
        chapters: [],
      });
    }
    const subjectGroup = subjectMap.get(subjectKey)!;

    let chapterGroup = subjectGroup.chapters.find((c) =>
      set.chapter ? c.chapterId === set.chapter.id : c.chapterId === null
    );
    if (!chapterGroup) {
      chapterGroup = {
        chapterId: set.chapter?.id ?? null,
        chapterTitle: set.chapter?.title ?? "General",
        sets: [],
      };
      subjectGroup.chapters.push(chapterGroup);
    }
    chapterGroup.sets.push(set);
  }

  return Array.from(subjectMap.values()).sort((a, b) => (a.subjectId ?? 0) - (b.subjectId ?? 0));
}

function SetCard({ set, bestScorePercent, index }: { set: QuestionSet; bestScorePercent: number | null; index: number }) {
  const diff = DIFFICULTY_META[set.difficulty] ?? DIFFICULTY_META.mixed;

  return (
    <motion.div
      className={`practice-card ${diff.className}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ y: -4 }}
    >
      <div className="practice-card__top">
        <span className={`practice-card__diff ${diff.className}`}>{diff.label}</span>
        {bestScorePercent !== null && (
          <span className="practice-card__best" title="Your best score">
            🏆 {Math.round(bestScorePercent)}%
          </span>
        )}
      </div>

      <h3 className="practice-card__title">{set.title}</h3>

      <div className="practice-card__meta">
        <span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
          </svg>
          {set._count?.items ?? 0} questions
        </span>
        <span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3.5 2" strokeLinecap="round" />
          </svg>
          ~{set.estimatedMinutes} min
        </span>
      </div>

      {Number(set.negativeMarking) > 0 && (
        <p className="practice-card__negative">⚠ −{set.negativeMarking} marks per wrong answer</p>
      )}

      <Link to={`/dashboard/practice/${set.id}/run`} className="practice-card__cta">
        {bestScorePercent !== null ? "Practice again" : "Start practice"}
        <span aria-hidden="true">→</span>
      </Link>
    </motion.div>
  );
}

export function DashboardPracticePage() {
  const { data: enrollments } = useMyEnrollments();
  const approvedCourses = enrollments?.filter((e) => e.status === "approved").map((e) => e.course);
  const { data: attempts } = useMyAttempts();

  const { selectedCourseId: courseId, setSelectedCourseId: setCourseId } = useSelectedCourse();

  useEffect(() => {
    if (!approvedCourses || approvedCourses.length === 0) return;
    if (courseId === null || !approvedCourses.some((c) => c.id === courseId)) {
      setCourseId(approvedCourses[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvedCourses]);

  const { data: sets, isLoading } = useQuestionSets({ courseId: courseId ?? undefined });
  const grouped = useMemo(() => groupSets(sets ?? []), [sets]);

  const bestScoreBySet = useMemo(() => {
    const map = new Map<number, number>();
    for (const a of attempts ?? []) {
      if (a.status !== "submitted" || a.score === null) continue;
      const percent = (Number(a.score) / Number(a.totalMarks)) * 100;
      const existing = map.get(a.questionSetId);
      if (existing === undefined || percent > existing) map.set(a.questionSetId, percent);
    }
    return map;
  }, [attempts]);

  const totalQuestions = (sets ?? []).reduce((sum, s) => sum + (s._count?.items ?? 0), 0);
  const chapterCount = new Set(grouped.flatMap((g) => g.chapters.map((c) => c.chapterId))).size;

  return (
    <section className="practice-page">
      <div className="practice-hero">
        <div className="practice-hero__icon">📝</div>
        <div className="practice-hero__body">
          <h1>MCQ Practice</h1>
          <p>Sharpen your recall chapter by chapter — pick a set below and jump straight in.</p>
        </div>
        {sets && sets.length > 0 && (
          <div className="practice-hero__stats">
            <div>
              <strong>{sets.length}</strong>
              <span>Sets</span>
            </div>
            <div>
              <strong>{totalQuestions}</strong>
              <span>Questions</span>
            </div>
            <div>
              <strong>{chapterCount}</strong>
              <span>Chapters</span>
            </div>
          </div>
        )}
      </div>

      {approvedCourses?.length === 0 && (
        <p className="practice-empty">
          You don't have any approved enrollments yet — <Link to="/courses">browse courses</Link>{" "}
          to get started.
        </p>
      )}

      {courseId && isLoading && <p>Loading...</p>}

      {courseId && !isLoading && grouped.length === 0 && (
        <div className="practice-empty-card">
          <span className="practice-empty-card__icon">📭</span>
          <p>No practice sets have been published for this course yet.</p>
        </div>
      )}

      {grouped.map((subjectGroup) => (
        <div key={subjectGroup.subjectId ?? "none"} className="practice-subject-block">
          <div className="practice-subject-block__header">
            <span className="practice-subject-block__avatar">
              {subjectGroup.subjectTitle.charAt(0).toUpperCase()}
            </span>
            <h2>{subjectGroup.subjectTitle}</h2>
          </div>

          {subjectGroup.chapters.map((chapterGroup) => (
            <div key={chapterGroup.chapterId ?? "none"} className="practice-chapter-block">
              <div className="practice-chapter-block__heading">
                <span>{chapterGroup.chapterTitle}</span>
                <span className="practice-chapter-block__count">{chapterGroup.sets.length}</span>
              </div>
              <div className="practice-card-grid">
                {chapterGroup.sets.map((set, i) => (
                  <SetCard key={set.id} set={set} bestScorePercent={bestScoreBySet.get(set.id) ?? null} index={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
