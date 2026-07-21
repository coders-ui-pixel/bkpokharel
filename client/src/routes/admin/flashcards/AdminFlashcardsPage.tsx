import { useState } from "react";
import type { FormEvent } from "react";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";
import { MathText } from "../../../components/ui/MathText";
import { useCourses } from "../../../features/courses/hooks";
import { useSubject, useSubjects } from "../../../features/subjects/hooks";
import {
  useCreateFlashCard,
  useDeleteFlashCard,
  useFlashCardsAdmin,
  useReorderFlashCard,
} from "../../../features/flashcards/hooks";

export function AdminFlashcardsPage() {
  const { data: courses } = useCourses();
  const [courseId, setCourseId] = useState<number | null>(null);
  const { data: subjects } = useSubjects(courseId ?? NaN);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const { data: subject } = useSubject(subjectId ?? NaN);
  const [chapterId, setChapterId] = useState<number | null>(null);

  const { data: cards, isLoading } = useFlashCardsAdmin(chapterId ?? NaN);
  const createCard = useCreateFlashCard(chapterId ?? NaN);
  const deleteCard = useDeleteFlashCard(chapterId ?? NaN);
  const reorderCard = useReorderFlashCard(chapterId ?? NaN);

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!chapterId) return;
    await createCard.mutateAsync({ front, back });
    setFront("");
    setBack("");
  }

  return (
    <section className="practice-page">
      <AdminPageHero
        icon="🗂"
        title="Flash Cards"
        subtitle="Create flash cards for students to study and self-test, chapter by chapter."
        stats={cards ? [{ label: "Cards in chapter", value: cards.length }] : undefined}
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
          <form onSubmit={handleCreate} className="admin-form">
            <label>
              Front (question)
              <textarea value={front} onChange={(e) => setFront(e.target.value)} required />
            </label>
            <label>
              Back (answer)
              <textarea value={back} onChange={(e) => setBack(e.target.value)} required />
            </label>
            <button type="submit" disabled={createCard.isPending}>
              {createCard.isPending ? "Adding..." : "Add flash card"}
            </button>
          </form>

          {isLoading && <p>Loading...</p>}

          <table className="admin-table">
            <thead>
              <tr>
                <th>Front</th>
                <th>Back</th>
                <th>Engagement</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cards?.map((card, index) => (
                <tr key={card.id}>
                  <td><MathText text={card.front} /></td>
                  <td><MathText text={card.back} /></td>
                  <td>
                    {card.studentsMastered}/{card.studentsEngaged} mastered
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => reorderCard.mutate({ id: card.id, direction: "up" })}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={index === (cards?.length ?? 0) - 1}
                        onClick={() => reorderCard.mutate({ id: card.id, direction: "down" })}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete this flash card?")) deleteCard.mutate(card.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {cards?.length === 0 && (
                <tr>
                  <td colSpan={4}>No flash cards yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
