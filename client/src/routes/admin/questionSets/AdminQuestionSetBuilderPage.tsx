import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { MathText } from "../../../components/ui/MathText";
import { useQuestions } from "../../../features/questionBank/hooks";
import { useQuestionSetForAdmin, useSetQuestionSetItems } from "../../../features/questionSets/hooks";

export function AdminQuestionSetBuilderPage() {
  const { id } = useParams();
  const setId = Number(id);
  const { data: set, isLoading } = useQuestionSetForAdmin(setId);
  const { data: bankQuestions } = useQuestions({
    subjectId: set?.subjectId ?? undefined,
    chapterId: set?.chapterId ?? undefined,
  });
  const setItems = useSetQuestionSetItems();

  const [selectedIds, setSelectedIds] = useState<number[] | null>(null);

  const currentIds = useMemo(
    () => selectedIds ?? set?.items.map((i) => i.questionId) ?? [],
    [selectedIds, set]
  );

  if (isLoading) return <p>Loading...</p>;
  if (!set) return <p>Question set not found.</p>;

  function toggle(questionId: number) {
    const next = currentIds.includes(questionId)
      ? currentIds.filter((id) => id !== questionId)
      : [...currentIds, questionId];
    setSelectedIds(next);
  }

  async function handleSave() {
    await setItems.mutateAsync({ id: setId, questionIds: currentIds });
    setSelectedIds(null);
  }

  const dirty = selectedIds !== null;

  return (
    <section>
      <h1>{set.title}</h1>
      <p className="course-meta">
        {currentIds.length} question{currentIds.length === 1 ? "" : "s"} selected · Difficulty:{" "}
        {set.difficulty}
      </p>

      {dirty && (
        <button type="button" className="btn btn--primary" onClick={handleSave} disabled={setItems.isPending}>
          {setItems.isPending ? "Saving..." : "Save changes"}
        </button>
      )}

      <h2>Available questions</h2>
      <p className="course-meta">
        Showing questions from the same course/chapter as this set. Check to include in the set.
      </p>

      <div className="qs-question-picker">
        {bankQuestions?.map((q) => (
          <label key={q.id} className="qs-question-picker__item">
            <input
              type="checkbox"
              checked={currentIds.includes(q.id)}
              onChange={() => toggle(q.id)}
            />
            <span>
              <MathText text={q.questionText} /> <span className="course-meta">({q.marks} marks, {q.difficulty ?? "—"})</span>
            </span>
          </label>
        ))}
        {bankQuestions?.length === 0 && (
          <p>No questions found for this chapter/course yet — add some in the Question Bank first.</p>
        )}
      </div>
    </section>
  );
}
