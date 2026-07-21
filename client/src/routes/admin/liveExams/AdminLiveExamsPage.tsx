import { useState } from "react";
import type { FormEvent } from "react";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";
import { useCourses } from "../../../features/courses/hooks";
import { useSubjects } from "../../../features/subjects/hooks";
import { useQuestionSets } from "../../../features/questionSets/hooks";
import {
  useCancelLiveExam,
  useCreateLiveExam,
  useDeleteLiveExam,
  useLiveExams,
} from "../../../features/liveExams/hooks";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Scheduled",
  live: "Live now",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function AdminLiveExamsPage() {
  const { data: courses } = useCourses();
  const [courseId, setCourseId] = useState<number | null>(null);
  const { data: subjects } = useSubjects(courseId ?? NaN);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const { data: sets } = useQuestionSets({ subjectId: subjectId ?? undefined });

  const { data: liveExams, isLoading } = useLiveExams();
  const createExam = useCreateLiveExam();
  const cancelExam = useCancelLiveExam();
  const deleteExam = useDeleteLiveExam();

  const [title, setTitle] = useState("");
  const [questionSetId, setQuestionSetId] = useState<number | null>(null);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!questionSetId) return;
    await createExam.mutateAsync({
      title,
      questionSetId,
      courseId: courseId ?? undefined,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
    });
    setTitle("");
    setQuestionSetId(null);
    setStartsAt("");
    setEndsAt("");
  }

  const liveCount = liveExams?.filter((e) => e.status === "live").length ?? 0;
  const scheduledCount = liveExams?.filter((e) => e.status === "scheduled").length ?? 0;

  return (
    <section className="practice-page">
      <AdminPageHero
        icon="⏱"
        title="Live Exams"
        subtitle="Schedule a live exam by assigning one of your existing question sets, with a start and end time."
        stats={
          liveExams
            ? [
                { label: "Live now", value: liveCount },
                { label: "Scheduled", value: scheduledCount },
                { label: "Total", value: liveExams.length },
              ]
            : undefined
        }
      />

      <div className="admin-panel">
      <form onSubmit={handleCreate} className="admin-form">
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Course
          <select
            value={courseId ?? ""}
            onChange={(e) => {
              setCourseId(e.target.value ? Number(e.target.value) : null);
              setSubjectId(null);
              setQuestionSetId(null);
            }}
          >
            <option value="">Select a course...</option>
            {courses?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        {courseId && (
          <label>
            Subject
            <select
              value={subjectId ?? ""}
              onChange={(e) => {
                setSubjectId(e.target.value ? Number(e.target.value) : null);
                setQuestionSetId(null);
              }}
            >
              <option value="">Select a subject...</option>
              {subjects?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>
        )}
        {subjectId && (
          <label>
            Question set
            <select
              value={questionSetId ?? ""}
              onChange={(e) => setQuestionSetId(e.target.value ? Number(e.target.value) : null)}
              required
            >
              <option value="">Select a question set...</option>
              {sets?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s._count?.items ?? 0} questions)
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Starts at
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
          />
        </label>
        <label>
          Ends at
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn btn--primary" disabled={!questionSetId || createExam.isPending}>
          {createExam.isPending ? "Scheduling..." : "Schedule live exam"}
        </button>
      </form>
      </div>

      <div className="admin-panel">
      <h2>All live exams</h2>
      {isLoading && <p>Loading...</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Question set</th>
            <th>Starts</th>
            <th>Ends</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {liveExams?.map((exam) => (
            <tr key={exam.id}>
              <td>{exam.title}</td>
              <td>{exam.questionSet.title}</td>
              <td>{new Date(exam.startsAt).toLocaleString()}</td>
              <td>{new Date(exam.endsAt).toLocaleString()}</td>
              <td>
                <span className={`badge ${exam.status === "live" ? "badge--pending" : ""}`}>
                  {STATUS_LABEL[exam.status]}
                </span>
              </td>
              <td>
                <div className="admin-table__actions">
                  {exam.status === "scheduled" && (
                    <button type="button" onClick={() => cancelExam.mutate(exam.id)}>
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete "${exam.title}"?`)) deleteExam.mutate(exam.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {liveExams?.length === 0 && (
            <tr>
              <td colSpan={6}>No live exams scheduled yet.</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </section>
  );
}
