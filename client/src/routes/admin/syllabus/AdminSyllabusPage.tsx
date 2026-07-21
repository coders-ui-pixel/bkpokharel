import { useState } from "react";
import type { FormEvent } from "react";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";
import { useCourses } from "../../../features/courses/hooks";
import {
  useCreateChapter,
  useCreateSubject,
  useDeleteChapter,
  useDeleteSubject,
  useSubject,
  useSubjects,
  useUpdateChapter,
  useUpdateSubject,
} from "../../../features/subjects/hooks";
import type { Subject } from "../../../features/subjects/types";

interface SubjectOutlineProps {
  subject: Subject;
  courseId: number;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: "up" | "down") => void;
}

function SubjectOutline({ subject, courseId, isFirst, isLast, onMove }: SubjectOutlineProps) {
  const { data: full } = useSubject(subject.id);
  const updateSubject = useUpdateSubject(courseId);
  const deleteSubject = useDeleteSubject(courseId);
  const createChapter = useCreateChapter(subject.id);
  const updateChapter = useUpdateChapter(subject.id);
  const deleteChapter = useDeleteChapter(subject.id);

  const [newChapterTitle, setNewChapterTitle] = useState("");

  async function handleAddChapter(event: FormEvent) {
    event.preventDefault();
    if (!newChapterTitle.trim()) return;
    await createChapter.mutateAsync({ title: newChapterTitle.trim() });
    setNewChapterTitle("");
  }

  function moveChapter(chapterId: number, direction: "up" | "down") {
    const chapters = full?.chapters ?? [];
    const index = chapters.findIndex((c) => c.id === chapterId);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapWith < 0 || swapWith >= chapters.length) return;
    const a = chapters[index];
    const b = chapters[swapWith];
    updateChapter.mutate({ chapterId: a.id, input: { orderIndex: b.orderIndex } });
    updateChapter.mutate({ chapterId: b.id, input: { orderIndex: a.orderIndex } });
  }

  return (
    <div className="syllabus-outline-subject">
      <div className="syllabus-outline-subject__head">
        <div className="syllabus-outline-subject__reorder">
          <button type="button" className="btn btn--ghost btn--sm" disabled={isFirst} onClick={() => onMove("up")}>
            ↑
          </button>
          <button type="button" className="btn btn--ghost btn--sm" disabled={isLast} onClick={() => onMove("down")}>
            ↓
          </button>
        </div>
        <h3>{subject.title}</h3>
        <div className="syllabus-outline-subject__actions">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              const newTitle = prompt("Rename subject", subject.title);
              if (newTitle && newTitle !== subject.title) {
                updateSubject.mutate({ subjectId: subject.id, input: { title: newTitle } });
              }
            }}
          >
            Rename
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              if (confirm(`Delete subject "${subject.title}"? This also deletes its chapters.`)) {
                deleteSubject.mutate(subject.id);
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <ol className="syllabus-outline-chapters">
        {full?.chapters?.map((chapter, i) => (
          <li key={chapter.id}>
            <span>{chapter.title}</span>
            <span className="syllabus-outline-chapters__actions">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={i === 0}
                onClick={() => moveChapter(chapter.id, "up")}
              >
                ↑
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={i === (full.chapters?.length ?? 1) - 1}
                onClick={() => moveChapter(chapter.id, "down")}
              >
                ↓
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  const newTitle = prompt("Rename chapter", chapter.title);
                  if (newTitle && newTitle !== chapter.title) {
                    updateChapter.mutate({ chapterId: chapter.id, input: { title: newTitle } });
                  }
                }}
              >
                Rename
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  if (confirm(`Delete chapter "${chapter.title}"?`)) deleteChapter.mutate(chapter.id);
                }}
              >
                Delete
              </button>
            </span>
          </li>
        ))}
        {full?.chapters?.length === 0 && <li className="course-meta">No chapters yet.</li>}
      </ol>

      <form onSubmit={handleAddChapter} className="admin-form admin-form--inline">
        <input
          value={newChapterTitle}
          onChange={(e) => setNewChapterTitle(e.target.value)}
          placeholder="New chapter title"
          maxLength={200}
        />
        <button type="submit" className="btn btn--ghost" disabled={createChapter.isPending}>
          {createChapter.isPending ? "Adding..." : "+ Add chapter"}
        </button>
      </form>
    </div>
  );
}

export function AdminSyllabusPage() {
  const { data: courses } = useCourses();
  const [courseId, setCourseId] = useState<number | null>(null);
  const { data: subjects, isLoading } = useSubjects(courseId ?? NaN);
  const createSubject = useCreateSubject(courseId ?? NaN);
  const updateSubject = useUpdateSubject(courseId ?? NaN);

  const [newSubjectTitle, setNewSubjectTitle] = useState("");

  async function handleAddSubject(event: FormEvent) {
    event.preventDefault();
    if (!courseId || !newSubjectTitle.trim()) return;
    await createSubject.mutateAsync({ title: newSubjectTitle.trim() });
    setNewSubjectTitle("");
  }

  function moveSubject(subjectId: number, direction: "up" | "down") {
    if (!subjects) return;
    const index = subjects.findIndex((s) => s.id === subjectId);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapWith < 0 || swapWith >= subjects.length) return;
    const a = subjects[index];
    const b = subjects[swapWith];
    updateSubject.mutate({ subjectId: a.id, input: { orderIndex: b.orderIndex } });
    updateSubject.mutate({ subjectId: b.id, input: { orderIndex: a.orderIndex } });
  }

  return (
    <section className="practice-page">
      <AdminPageHero
        icon="🧭"
        title="Syllabus"
        subtitle="Pick a course to view and edit its full syllabus outline — subjects and chapters, in the order students see them."
        stats={subjects && courseId ? [{ label: "Subjects", value: subjects.length }] : undefined}
      />

      <div className="admin-panel">
        <div className="admin-form">
          <label>
            Course
            <select
              value={courseId ?? ""}
              onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Select a course...</option>
              {courses?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {courseId && (
          <form onSubmit={handleAddSubject} className="admin-form admin-form--inline" style={{ marginTop: 8 }}>
            <input
              value={newSubjectTitle}
              onChange={(e) => setNewSubjectTitle(e.target.value)}
              placeholder="New subject title (e.g. Physics)"
              maxLength={200}
            />
            <button type="submit" className="btn btn--primary" disabled={createSubject.isPending}>
              {createSubject.isPending ? "Adding..." : "+ Add subject"}
            </button>
          </form>
        )}
      </div>

      {courseId && (
        <div className="admin-panel">
          {isLoading && <p>Loading...</p>}
          {subjects?.map((subject, i) => (
            <SubjectOutline
              key={subject.id}
              subject={subject}
              courseId={courseId}
              isFirst={i === 0}
              isLast={i === subjects.length - 1}
              onMove={(direction) => moveSubject(subject.id, direction)}
            />
          ))}
          {subjects?.length === 0 && <p>No subjects yet — add one above.</p>}
        </div>
      )}
    </section>
  );
}
