import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";
import { useCourses } from "../../../features/courses/hooks";
import { useSubject, useSubjects } from "../../../features/subjects/hooks";
import {
  useDeleteImportantQuestion,
  useImportantQuestions,
  useReorderImportantQuestion,
  useUploadImportantQuestion,
} from "../../../features/importantQuestions/hooks";
import { assetUrl } from "../../../lib/assetUrl";

export function AdminImportantQuestionsPage() {
  const { data: courses } = useCourses();
  const [courseId, setCourseId] = useState<number | null>(null);
  const { data: subjects } = useSubjects(courseId ?? NaN);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const { data: subject } = useSubject(subjectId ?? NaN);
  const [chapterId, setChapterId] = useState<number | null>(null);

  const { data: items, isLoading } = useImportantQuestions(chapterId ?? NaN);
  const uploadItem = useUploadImportantQuestion(chapterId ?? NaN);
  const deleteItem = useDeleteImportantQuestion(chapterId ?? NaN);
  const reorderItem = useReorderImportantQuestion(chapterId ?? NaN);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(event: FormEvent) {
    event.preventDefault();
    if (!file || !chapterId) return;
    await uploadItem.mutateAsync({ title, file });
    setTitle("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <section className="practice-page">
      <AdminPageHero
        icon="⭐"
        title="Important Questions"
        subtitle="Upload a poster (PNG/JPEG) or PDF of important questions per chapter."
        stats={items ? [{ label: "Items in chapter", value: items.length }] : undefined}
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
              setChapterId(null);
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
                setChapterId(null);
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
        {subject && (
          <label>
            Chapter
            <select value={chapterId ?? ""} onChange={(e) => setChapterId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">Select a chapter...</option>
              {subject.chapters?.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      </div>

      {chapterId && (
        <div className="admin-panel">
          <form onSubmit={handleUpload} className="admin-form">
            <label>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label>
              File (PNG, JPEG, or PDF)
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                required
              />
            </label>
            <button type="submit" disabled={!file || uploadItem.isPending}>
              {uploadItem.isPending ? "Uploading..." : "Upload"}
            </button>
          </form>

          {isLoading && <p>Loading...</p>}

          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Bookmarks</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item, index) => (
                <tr key={item.id}>
                  <td>
                    <a href={assetUrl(item.filePath)} target="_blank" rel="noreferrer">
                      {item.title}
                    </a>
                  </td>
                  <td>{item.mimeType}</td>
                  <td>{item.bookmarkCount ?? 0}</td>
                  <td>
                    <div className="admin-table__actions">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => reorderItem.mutate({ id: item.id, direction: "up" })}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={index === (items?.length ?? 0) - 1}
                        onClick={() => reorderItem.mutate({ id: item.id, direction: "down" })}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete "${item.title}"?`)) deleteItem.mutate(item.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items?.length === 0 && (
                <tr>
                  <td colSpan={4}>Nothing uploaded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
