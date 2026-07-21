import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { useMyEnrollments } from "../../../features/courses/hooks";
import { useSelectedCourse } from "../../../context/SelectedCourseContext";
import { useSubject, useSubjects } from "../../../features/subjects/hooks";
import { useNotes } from "../../../features/notes/hooks";
import { noteFileUrl } from "../../../features/notes/api";
import { useQuestionSets } from "../../../features/questionSets/hooks";
import { PdfViewer } from "../../../components/pdf/PdfViewer";
import { BookmarkButton } from "../../../components/dashboard/BookmarkButton";
import { ChapterTestLauncher } from "../../../components/dashboard/ChapterTestLauncher";
import { getAccessToken } from "../../../lib/apiClient";
import type { Note } from "../../../features/notes/types";
import type { QuestionSet } from "../../../features/questionSets/types";
import type { Chapter } from "../../../features/subjects/types";
import { findRecentNote, recordNoteOpened } from "../../../lib/recentNotes";

function ChapterNotesSection({
  chapter,
  chapterSets,
  onOpenNote,
}: {
  chapter: Chapter;
  chapterSets: QuestionSet[];
  onOpenNote: (note: Note) => void;
}) {
  const { data: notes, isLoading } = useNotes(chapter.id);

  return (
    <div className="practice-chapter-block">
      <div className="practice-chapter-block__heading practice-chapter-block__heading--lg">
        <span>{chapter.title}</span>
        <ChapterTestLauncher sets={chapterSets} />
      </div>

      {isLoading && <p>Loading...</p>}
      {!isLoading && notes?.length === 0 && (
        <p className="course-meta" style={{ marginBottom: 16 }}>
          No notes uploaded for this chapter yet.
        </p>
      )}

      <div className="practice-card-grid">
        {notes?.map((note, i) => (
          <motion.div
            key={note.id}
            className="note-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3) }}
            whileHover={{ y: -4 }}
          >
            <div className="note-card__top">
              <span className="note-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M6 2h9l3 3v17H6Z" />
                  <path d="M9 11h6M9 15h6M9 7h3" strokeLinecap="round" />
                </svg>
              </span>
              <BookmarkButton contentType="note" contentId={note.id} />
            </div>
            <h3 className="note-card__title">{note.title}</h3>
            <button type="button" className="note-card__cta" onClick={() => onOpenNote(note)}>
              Open notes <span aria-hidden="true">→</span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function DashboardNotesPage() {
  const { data: enrollments } = useMyEnrollments();
  const approvedCourses = enrollments?.filter((e) => e.status === "approved").map((e) => e.course);

  const [searchParams, setSearchParams] = useSearchParams();

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

  const [activeNote, setActiveNote] = useState<Note | null>(null);

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

  useEffect(() => {
    const openNoteId = searchParams.get("openNoteId");
    if (openNoteId) {
      const recent = findRecentNote(Number(openNoteId));
      if (recent) {
        setActiveNote({
          id: recent.id,
          title: recent.title,
          filePath: recent.filePath,
          chapterId: recent.chapterId,
          orderIndex: 0,
          createdAt: recent.openedAt,
        });
      }
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openNote(note: Note) {
    setActiveNote(note);
    recordNoteOpened({
      id: note.id,
      title: note.title,
      filePath: note.filePath,
      chapterId: note.chapterId,
    });
  }

  if (activeNote) {
    const token = getAccessToken();
    return (
      <section>
        <button type="button" className="btn btn--ghost" onClick={() => setActiveNote(null)} style={{ marginBottom: 12 }}>
          ← Back to notes
        </button>
        <PdfViewer
          noteId={activeNote.id}
          filePath={activeNote.filePath}
          title={activeNote.title}
          secureUrl={noteFileUrl(activeNote.chapterId, activeNote.id)}
          authHeaders={token ? { Authorization: `Bearer ${token}` } : undefined}
        />
      </section>
    );
  }

  return (
    <section className="practice-page">
      <div className="practice-hero practice-hero--notes">
        <div className="practice-hero__icon">📚</div>
        <div className="practice-hero__body">
          <h1>Study Notes</h1>
          <p>Chapter-wise notes for every subject — read, bookmark, and jump straight to the test.</p>
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
        <ChapterNotesSection
          key={chapter.id}
          chapter={chapter}
          chapterSets={setsByChapter.get(chapter.id) ?? []}
          onOpenNote={openNote}
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
