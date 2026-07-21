import { useState } from "react";
import type { FormEvent } from "react";
import { MathText } from "../../../components/ui/MathText";
import { useQuestions } from "../../../features/questionBank/hooks";
import type { Difficulty } from "../../../features/questionBank/types";
import { useCreateQuestionSet, useSetQuestionSetItems } from "../../../features/questionSets/hooks";
import { useSubject } from "../../../features/subjects/hooks";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function CreateQuestionSetModal({
  subjectId,
  onClose,
  onCreated,
}: {
  subjectId: number;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { data: subject } = useSubject(subjectId);
  const createSet = useCreateQuestionSet();
  const setItems = useSetQuestionSetItems();

  const [step, setStep] = useState<"details" | "questions">("details");
  const [title, setTitle] = useState("");
  const [chapterId, setChapterId] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("mixed");
  const [negativeMarking, setNegativeMarking] = useState("0");
  const [estimatedMinutes, setEstimatedMinutes] = useState("30");

  const [mode, setMode] = useState<"manual" | "random">("manual");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [randomCount, setRandomCount] = useState("10");
  const [randomDifficulty, setRandomDifficulty] = useState<Difficulty | "">("");
  const [saving, setSaving] = useState(false);

  const { data: bankQuestions } = useQuestions({
    subjectId,
    chapterId: chapterId ?? undefined,
  });

  function handleDetailsSubmit(event: FormEvent) {
    event.preventDefault();
    setStep("questions");
  }

  function toggle(id: number) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleCreate() {
    setSaving(true);
    try {
      const set = await createSet.mutateAsync({
        title,
        subjectId,
        chapterId: chapterId ?? undefined,
        difficulty,
        negativeMarking: Number(negativeMarking),
        estimatedMinutes: Number(estimatedMinutes),
      });

      let questionIds = selectedIds;
      if (mode === "random") {
        const pool = (bankQuestions ?? []).filter(
          (q) => !randomDifficulty || q.difficulty === randomDifficulty
        );
        questionIds = shuffle(pool)
          .slice(0, Number(randomCount))
          .map((q) => q.id);
      }

      if (questionIds.length > 0) {
        await setItems.mutateAsync({ id: set.id, questionIds });
      }

      onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-card__header">
          <h2>Create new question set</h2>
          <button type="button" className="modal-card__close" onClick={onClose}>
            ✕
          </button>
        </div>

        {step === "details" && (
          <form onSubmit={handleDetailsSubmit} className="admin-form">
            <label>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label>
              Chapter (optional — leave blank for a mixed set across the subject)
              <select
                value={chapterId ?? ""}
                onChange={(e) => setChapterId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">All chapters in {subject?.title}</option>
                {subject?.chapters?.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Difficulty
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
                <option value="mixed">Mixed</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
            <label>
              Negative marking (fraction deducted per wrong answer, e.g. 0.25)
              <input
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={negativeMarking}
                onChange={(e) => setNegativeMarking(e.target.value)}
              />
            </label>
            <label>
              Estimated time (minutes)
              <input
                type="number"
                min="1"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
              />
            </label>
            <button type="submit">Next: choose questions →</button>
          </form>
        )}

        {step === "questions" && (
          <div>
            <div className="modal-mode-toggle">
              <button
                type="button"
                className={mode === "manual" ? "is-active" : ""}
                onClick={() => setMode("manual")}
              >
                Fetch from question bank
              </button>
              <button
                type="button"
                className={mode === "random" ? "is-active" : ""}
                onClick={() => setMode("random")}
              >
                Random questions
              </button>
            </div>

            {mode === "manual" && (
              <div className="qs-question-picker">
                {bankQuestions?.map((q) => (
                  <label key={q.id} className="qs-question-picker__item">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(q.id)}
                      onChange={() => toggle(q.id)}
                    />
                    <span>
                      <MathText text={q.questionText} />{" "}
                      <span className="course-meta">
                        ({q.marks} marks, {q.difficulty ?? "—"})
                      </span>
                    </span>
                  </label>
                ))}
                {bankQuestions?.length === 0 && <p>No questions found here yet.</p>}
                <p className="course-meta">{selectedIds.length} selected</p>
              </div>
            )}

            {mode === "random" && (
              <div className="admin-form">
                <label>
                  Number of questions required
                  <input
                    type="number"
                    min="1"
                    max={bankQuestions?.length ?? 100}
                    value={randomCount}
                    onChange={(e) => setRandomCount(e.target.value)}
                  />
                </label>
                <label>
                  Only from difficulty (optional)
                  <select
                    value={randomDifficulty}
                    onChange={(e) => setRandomDifficulty(e.target.value as Difficulty | "")}
                  >
                    <option value="">Any difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </label>
                <p className="course-meta">{bankQuestions?.length ?? 0} questions available in this pool</p>
              </div>
            )}

            <div className="modal-card__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setStep("details")}>
                ← Back
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleCreate}
                disabled={saving}
              >
                {saving ? "Creating..." : "Create question set"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
