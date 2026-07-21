import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useMyEnrollments } from "../../../features/courses/hooks";
import { useSelectedCourse } from "../../../context/SelectedCourseContext";
import { useSubject, useSubjects } from "../../../features/subjects/hooks";
import { useImportantQuestions } from "../../../features/importantQuestions/hooks";
import { useQuestionSets } from "../../../features/questionSets/hooks";
import { ImportantQuestionViewer } from "../../../components/pdf/ImportantQuestionViewer";
import { BookmarkButton } from "../../../components/dashboard/BookmarkButton";
import { ChapterTestLauncher } from "../../../components/dashboard/ChapterTestLauncher";
import type { ImportantQuestionItem } from "../../../features/importantQuestions/types";
import type { QuestionSet } from "../../../features/questionSets/types";
import type { Chapter } from "../../../features/subjects/types";

function ChapterImportantQuestionsSection({
  chapter,
  chapterSets,
  onOpen,
}: {
  chapter: Chapter;
  chapterSets: QuestionSet[];
  onOpen: (item: ImportantQuestionItem) => void;
}) {
  const { data: items, isLoading } = useImportantQuestions(chapter.id);

  return (
    <div className="practice-chapter-block">
      <div className="practice-chapter-block__heading practice-chapter-block__heading--lg">
        <span>{chapter.title}</span>
        <ChapterTestLauncher sets={chapterSets} />
      </div>

      {isLoading && <p>Loading...</p>}
      {!isLoading && items?.length === 0 && (
        <p className="course-meta" style={{ marginBottom: 16 }}>
          Nothing uploaded for this chapter yet.
        </p>
      )}

      <div className="practice-card-grid">
        {items?.map((item, i) => (
          <motion.div
            key={item.id}
            className="note-card note-card--iq"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3) }}
            whileHover={{ y: -4 }}
          >
            <div className="note-card__top">
              <span className="note-card__icon note-card__icon--amber">
                {item.mimeType === "application/pdf" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M6 2h9l3 3v17H6Z" />
                    <path d="M9 11h6M9 15h6M9 7h3" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                )}
              </span>
              <BookmarkButton contentType="important_question" contentId={item.id} />
            </div>
            <h3 className="note-card__title">{item.title}</h3>
            <button type="button" className="note-card__cta" onClick={() => onOpen(item)}>
              View <span aria-hidden="true">→</span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function DashboardImportantQuestionsPage() {
  const { data: enrollments } = useMyEnrollments();
  const approvedCourses = enrollments?.filter((e) => e.status === "approved").map((e) => e.course);

  const { selectedCourseId: courseId, setSelectedCourseId: setCourseId } = useSelectedCourse();
  const { data: subjects } = useSubjects(courseId ?? NaN);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const { data: subject } = useSubject(subjectId ?? NaN);

  const { data: courseSets } = useQuestionSets({ courseId: courseId ?? undefined });
  const setsByChapter = useMemo(() => {
    const map = new Map<number, QuestionSet[]>();
    for (const set of courseSets ?? []) {
      if (!set.chapter) continue;
      const list = map.get(set.chapter.id) ?? [];
      list.push(set);
      map.set(set.chapter.id, list);
    }
    return map;
  }, [courseSets]);

  const [active, setActive] = useState<ImportantQuestionItem | null>(null);

  useEffect(() => {
    if (!approvedCourses || approvedCourses.length === 0) return;
    if (courseId === null || !approvedCourses.some((c) => c.id === courseId)) {
      setCourseId(approvedCourses[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvedCourses]);

  useEffect(() => {
    setSubjectId(null);
  }, [courseId]);

  useEffect(() => {
    if (subjects && subjects.length === 1 && subjectId === null) {
      setSubjectId(subjects[0].id);
    }
  }, [subjects, subjectId]);

  if (active) {
    return (
      <section>
        <button type="button" className="btn btn--ghost" onClick={() => setActive(null)} style={{ marginBottom: 12 }}>
          ← Back
        </button>
        <ImportantQuestionViewer item={active} />
      </section>
    );
  }

  return (
    <section className="practice-page">
      <div className="practice-hero practice-hero--iq">
        <div className="practice-hero__icon">⭐</div>
        <div className="practice-hero__body">
          <h1>Important Questions</h1>
          <p>Chapter-wise exam-focused question sheets, handpicked by your instructors.</p>
        </div>
      </div>

      {approvedCourses?.length === 0 && (
        <p className="practice-empty">
          You don't have any approved enrollments yet — <Link to="/courses">browse courses</Link>{" "}
          to get started.
        </p>
      )}

      {subjects && subjects.length > 1 && (
        <div className="practice-course-tabs practice-course-tabs--sub">
          {subjects.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`practice-course-tab ${subjectId === s.id ? "is-active" : ""}`}
              onClick={() => setSubjectId(s.id)}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      {subject?.chapters?.map((chapter) => (
        <ChapterImportantQuestionsSection
          key={chapter.id}
          chapter={chapter}
          chapterSets={setsByChapter.get(chapter.id) ?? []}
          onOpen={setActive}
        />
      ))}

      {courseId && subjects?.length === 0 && (
        <div className="practice-empty-card">
          <span className="practice-empty-card__icon">📭</span>
          <p>No subjects have been added to this course yet.</p>
        </div>
      )}
      {subject && subject.chapters?.length === 0 && (
        <div className="practice-empty-card">
          <span className="practice-empty-card__icon">📭</span>
          <p>No chapters in this subject yet.</p>
        </div>
      )}
    </section>
  );
}
