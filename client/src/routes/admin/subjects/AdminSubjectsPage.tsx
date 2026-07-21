import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";
import { useCourses } from "../../../features/courses/hooks";
import {
  useAllSubjects,
  useAssignSubjectToCourse,
  useCreateStandaloneSubject,
  useDeleteSubjectById,
} from "../../../features/subjects/hooks";

const UNASSIGNED_FILTER = "unassigned";
const ALL_FILTER = "all";

export function AdminSubjectsPage() {
  const { data: courses } = useCourses();
  const { data: subjects, isLoading } = useAllSubjects();
  const createSubject = useCreateStandaloneSubject();
  const assignSubject = useAssignSubjectToCourse();
  const deleteSubject = useDeleteSubjectById();

  const [filter, setFilter] = useState<string>(ALL_FILTER);
  const [title, setTitle] = useState("");
  const [newSubjectCourseId, setNewSubjectCourseId] = useState<string>("");

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    await createSubject.mutateAsync({
      title,
      courseId: newSubjectCourseId ? Number(newSubjectCourseId) : null,
    });
    setTitle("");
    setNewSubjectCourseId("");
  }

  const filtered = useMemo(() => {
    if (!subjects) return [];
    if (filter === ALL_FILTER) return subjects;
    if (filter === UNASSIGNED_FILTER) return subjects.filter((s) => s.courseId === null);
    return subjects.filter((s) => s.courseId === Number(filter));
  }, [subjects, filter]);

  const unassignedCount = subjects?.filter((s) => s.courseId === null).length ?? 0;

  return (
    <section className="practice-page">
      <AdminPageHero
        icon="📚"
        title="Subjects"
        subtitle="Build a library of subjects, then assign each one to a course whenever it's ready — chapters live inside each subject."
        stats={[
          { label: "Total subjects", value: subjects?.length ?? 0 },
          { label: "Not yet assigned", value: unassignedCount },
        ]}
      />

      <div className="admin-panel">
        <h2 className="admin-section__heading">Create a subject</h2>
        <p className="course-meta">
          Leave "Course" unset to save this subject in the library first — you can assign it to a
          course at any time from the list below.
        </p>
        <form onSubmit={handleCreate} className="admin-form admin-form--inline">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Subject title (e.g. Physics)"
            required
            maxLength={120}
          />
          <select
            value={newSubjectCourseId}
            onChange={(e) => setNewSubjectCourseId(e.target.value)}
          >
            <option value="">No course yet (save to library)</option>
            {courses?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn--primary" disabled={createSubject.isPending}>
            {createSubject.isPending ? "Adding..." : "+ Add subject"}
          </button>
        </form>
      </div>

      <div className="admin-panel">
        <div className="admin-form" style={{ maxWidth: 320 }}>
          <label>
            Filter
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value={ALL_FILTER}>All subjects</option>
              <option value={UNASSIGNED_FILTER}>Unassigned only ({unassignedCount})</option>
              {courses?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isLoading && <p>Loading...</p>}

        <div className="subject-grid">
          {filtered.map((s) => (
            <div key={s.id} className="subject-card-wrap">
              <Link to={`/admin/subjects/${s.id}`} className="subject-card">
                <h3>{s.title}</h3>
                <p className="course-meta">{s._count?.chapters ?? 0} chapters</p>
                <span className={`badge ${s.course ? "" : "badge--pending"}`}>
                  {s.course ? s.course.title : "Unassigned"}
                </span>
              </Link>
              <select
                value={s.courseId ?? ""}
                onChange={(e) =>
                  assignSubject.mutate({
                    subjectId: s.id,
                    courseId: e.target.value ? Number(e.target.value) : null,
                  })
                }
              >
                <option value="">Unassigned</option>
                {courses?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  if (confirm(`Delete subject "${s.title}"? This also deletes its chapters.`)) {
                    deleteSubject.mutate(s.id);
                  }
                }}
              >
                Delete
              </button>
            </div>
          ))}
          {filtered.length === 0 && !isLoading && <p>No subjects match this filter.</p>}
        </div>
      </div>
    </section>
  );
}
