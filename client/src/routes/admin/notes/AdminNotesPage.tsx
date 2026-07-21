import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";
import { useCourses } from "../../../features/courses/hooks";
import { useSubject, useSubjects } from "../../../features/subjects/hooks";
import {
  useDeleteNote,
  useNotes,
  useReorderNote,
  useReplaceNote,
  useUploadNote,
} from "../../../features/notes/hooks";
import { apiClient } from "../../../lib/apiClient";

async function openNoteFile(chapterId: number, noteId: number) {
  const { data } = await apiClient.get(`/chapters/${chapterId}/notes/${noteId}/file`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(data);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function AdminNotesPage() {
  const { data: courses } = useCourses();
  const [courseId, setCourseId] = useState<number | null>(null);
  const { data: subjects } = useSubjects(courseId ?? NaN);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const { data: subject } = useSubject(subjectId ?? NaN);
  const [chapterId, setChapterId] = useState<number | null>(null);

  const { data: notes, isLoading } = useNotes(chapterId ?? NaN);
  const uploadNote = useUploadNote(chapterId ?? NaN);
  const replaceNote = useReplaceNote(chapterId ?? NaN);
  const deleteNote = useDeleteNote(chapterId ?? NaN);
  const reorderNote = useReorderNote(chapterId ?? NaN);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<Record<number, HTMLInputElement | null>>({});

  async function handleUpload(event: FormEvent) {
    event.preventDefault();
    if (!file || !chapterId) return;
    await uploadNote.mutateAsync({ title, file });
    setTitle("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <section className="practice-page">
      <AdminPageHero
        icon="📗"
        title="Study Notes"
        subtitle="Upload chapter-wise PDF notes for enrolled students."
        stats={notes ? [{ label: "Notes in chapter", value: notes.length }] : undefined}
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
              Note title
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label>
              PDF file
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                required
              />
            </label>
            <button type="submit" disabled={!file || uploadNote.isPending}>
              {uploadNote.isPending ? "Uploading..." : "Upload note"}
            </button>
          </form>

          {isLoading && <p>Loading...</p>}

          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Bookmarks</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {notes?.map((note, index) => (
                <tr key={note.id}>
                  <td>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => void openNoteFile(note.chapterId, note.id)}
                    >
                      {note.title}
                    </button>
                  </td>
                  <td>{note.bookmarkCount ?? 0}</td>
                  <td>
                    <div className="admin-table__actions">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => reorderNote.mutate({ noteId: note.id, direction: "up" })}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={index === (notes?.length ?? 0) - 1}
                        onClick={() => reorderNote.mutate({ noteId: note.id, direction: "down" })}
                      >
                        ↓
                      </button>
                      <button type="button" onClick={() => replaceInputRef.current[note.id]?.click()}>
                        Replace
                      </button>
                      <input
                        ref={(el) => {
                          replaceInputRef.current[note.id] = el;
                        }}
                        type="file"
                        accept="application/pdf"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const newFile = e.target.files?.[0];
                          if (newFile) replaceNote.mutate({ noteId: note.id, file: newFile });
                          e.target.value = "";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete "${note.title}"?`)) deleteNote.mutate(note.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {notes?.length === 0 && (
                <tr>
                  <td colSpan={3}>No notes uploaded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
