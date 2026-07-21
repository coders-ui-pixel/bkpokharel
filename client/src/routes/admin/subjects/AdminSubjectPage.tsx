import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useCreateChapter,
  useDeleteChapter,
  useSubject,
  useUpdateChapter,
} from "../../../features/subjects/hooks";

export function AdminSubjectPage() {
  const { id } = useParams();
  const subjectId = Number(id);
  const { data: subject, isLoading } = useSubject(subjectId);
  const createChapter = useCreateChapter(subjectId);
  const updateChapter = useUpdateChapter(subjectId);
  const deleteChapter = useDeleteChapter(subjectId);

  const [title, setTitle] = useState("");

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    await createChapter.mutateAsync({ title });
    setTitle("");
  }

  if (isLoading) return <p>Loading...</p>;
  if (!subject) return <p>Subject not found.</p>;

  return (
    <section>
      <div className="admin-page-header">
        <h1>{subject.title}</h1>
        <Link
          to={subject.courseId ? `/admin/courses/${subject.courseId}` : "/admin/subjects"}
          className="btn btn--ghost"
        >
          {subject.courseId ? "← Back to course" : "← Back to subjects"}
        </Link>
      </div>

      <form onSubmit={handleCreate} className="admin-form">
        <label>
          New chapter title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <button type="submit" disabled={createChapter.isPending}>
          {createChapter.isPending ? "Adding..." : "Add chapter"}
        </button>
      </form>

      <ol className="chapter-list">
        {subject.chapters?.map((chapter) => (
          <li key={chapter.id}>
            {chapter.title}{" "}
            <button
              type="button"
              onClick={() => {
                const newTitle = prompt("Rename chapter", chapter.title);
                if (newTitle && newTitle !== chapter.title) {
                  updateChapter.mutate({ chapterId: chapter.id, input: { title: newTitle } });
                }
              }}
            >
              Rename
            </button>{" "}
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete "${chapter.title}"?`)) deleteChapter.mutate(chapter.id);
              }}
            >
              Delete
            </button>
          </li>
        ))}
        {subject.chapters?.length === 0 && <li>No chapters yet.</li>}
      </ol>
    </section>
  );
}
