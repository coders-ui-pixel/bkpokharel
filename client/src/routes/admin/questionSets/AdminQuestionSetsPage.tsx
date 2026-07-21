import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";
import { useCourses } from "../../../features/courses/hooks";
import { useSubjects } from "../../../features/subjects/hooks";
import {
  useDeleteQuestionSet,
  useQuestionSets,
  useUpdateQuestionSet,
} from "../../../features/questionSets/hooks";
import { CreateQuestionSetModal } from "./CreateQuestionSetModal";

export function AdminQuestionSetsPage() {
  const { data: courses } = useCourses();
  const [courseId, setCourseId] = useState<number | null>(null);
  const { data: subjects } = useSubjects(courseId ?? NaN);
  const [subjectId, setSubjectId] = useState<number | null>(null);

  const { data: sets, isLoading, refetch } = useQuestionSets({ subjectId: subjectId ?? undefined });
  const updateSet = useUpdateQuestionSet();
  const deleteSet = useDeleteQuestionSet();

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="practice-page">
      <AdminPageHero
        icon="🧩"
        title="Question Sets"
        subtitle="Bundle questions from the bank into sets for practice or live exams."
        stats={sets ? [{ label: "Sets in view", value: sets.length }] : undefined}
        action={
          subjectId ? (
            <button type="button" className="btn" onClick={() => setModalOpen(true)}>
              + Create new set
            </button>
          ) : undefined
        }
      />

      <div className="admin-panel">
      <div className="admin-form">
        <label>
          Course
          <select
            value={courseId ?? ""}
            onChange={(e) => {
              setCourseId(e.target.value ? Number(e.target.value) : null);
              setSubjectId(null);
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
              onChange={(e) => setSubjectId(e.target.value ? Number(e.target.value) : null)}
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
      </div>
      </div>

      {subjectId && (
        <div className="admin-panel">
          {isLoading && <p>Loading...</p>}

          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Questions</th>
                <th>Published</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sets?.map((set) => (
                <tr key={set.id}>
                  <td>{set.title}</td>
                  <td>{set.difficulty}</td>
                  <td>{set._count?.items ?? 0}</td>
                  <td>{set.isPublished ? "Yes" : "No"}</td>
                  <td>
                    <div className="admin-table__actions">
                      <Link to={`/admin/question-sets/${set.id}`}>Manage questions</Link>
                      <button
                        type="button"
                        onClick={() =>
                          updateSet.mutate({ id: set.id, input: { isPublished: !set.isPublished } })
                        }
                      >
                        {set.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete "${set.title}"?`)) deleteSet.mutate(set.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sets?.length === 0 && (
                <tr>
                  <td colSpan={5}>No question sets yet — create one above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && subjectId && (
        <CreateQuestionSetModal
          subjectId={subjectId}
          onClose={() => setModalOpen(false)}
          onCreated={() => {
            setModalOpen(false);
            refetch();
          }}
        />
      )}
    </section>
  );
}
