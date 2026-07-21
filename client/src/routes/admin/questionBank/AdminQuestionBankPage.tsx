import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";
import { MathText } from "../../../components/ui/MathText";
import { useCourses } from "../../../features/courses/hooks";
import { useSubject, useSubjects } from "../../../features/subjects/hooks";
import {
  useConfirmCsvImport,
  useCreateQuestion,
  useDeleteQuestion,
  useQuestions,
  useUpdateQuestion,
  useUploadCsvDryRun,
} from "../../../features/questionBank/hooks";
import type { CorrectOption, CsvValidRow, Difficulty, Question } from "../../../features/questionBank/types";

const OPTION_KEYS = ["optionA", "optionB", "optionC", "optionD"] as const;
const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

const EMPTY_FORM = {
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: "A" as CorrectOption,
  marks: "1",
  difficulty: "" as Difficulty | "",
  explanation: "",
};

type QuestionFormState = typeof EMPTY_FORM;

function questionToForm(q: Question): QuestionFormState {
  return {
    questionText: q.questionText,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    correctOption: q.correctOption,
    marks: String(q.marks),
    difficulty: q.difficulty ?? "",
    explanation: q.explanation ?? "",
  };
}

function QuestionFormFields({
  form,
  onChange,
}: {
  form: QuestionFormState;
  onChange: (patch: Partial<QuestionFormState>) => void;
}) {
  return (
    <>
      <label>
        Question (LaTeX supported — wrap math in $...$ or $$...$$)
        <textarea
          value={form.questionText}
          onChange={(e) => onChange({ questionText: e.target.value })}
          required
          rows={3}
        />
      </label>
      {OPTION_KEYS.map((key, i) => (
        <label key={key}>
          {`Option ${OPTION_LETTERS[i]}`}
          <input value={form[key]} onChange={(e) => onChange({ [key]: e.target.value })} required />
        </label>
      ))}
      <label>
        Correct option
        <select
          value={form.correctOption}
          onChange={(e) => onChange({ correctOption: e.target.value as CorrectOption })}
        >
          {OPTION_LETTERS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label>
        Marks
        <input
          type="number"
          min="0.5"
          step="0.5"
          value={form.marks}
          onChange={(e) => onChange({ marks: e.target.value })}
        />
      </label>
      <label>
        Difficulty
        <select value={form.difficulty} onChange={(e) => onChange({ difficulty: e.target.value as Difficulty })}>
          <option value="">None</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>
      <label>
        Explanation (optional)
        <textarea value={form.explanation} onChange={(e) => onChange({ explanation: e.target.value })} rows={2} />
      </label>
    </>
  );
}

function QuestionLivePreview({ form }: { form: QuestionFormState }) {
  if (!form.questionText.trim()) return null;
  return (
    <div className="qb-live-preview">
      <span className="qb-live-preview__label">Live preview</span>
      <p className="qb-live-preview__question">
        <MathText text={form.questionText} />
      </p>
      <ul className="qb-live-preview__options">
        {OPTION_LETTERS.map((letter, i) => {
          const value = form[OPTION_KEYS[i]];
          if (!value.trim()) return null;
          return (
            <li key={letter} className={form.correctOption === letter ? "is-correct" : ""}>
              <strong>{letter}.</strong> <MathText text={value} />
            </li>
          );
        })}
      </ul>
      {form.explanation.trim() && (
        <p className="qb-live-preview__explanation">
          <MathText text={form.explanation} />
        </p>
      )}
    </div>
  );
}

function CsvRowCard({
  row,
  index,
  onChange,
  onRemove,
}: {
  row: CsvValidRow;
  index: number;
  onChange: (patch: Partial<CsvValidRow>) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="qb-csv-row">
      <div className="qb-csv-row__header">
        <span>Row {index + 1}</span>
        <div className="qb-csv-row__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditing((v) => !v)}>
            {editing ? "Done editing" : "Edit"}
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>

      {!editing ? (
        <div className="qb-csv-row__preview">
          <p>
            <MathText text={row.questionText} />
          </p>
          <ul>
            {OPTION_LETTERS.map((letter, i) => (
              <li key={letter} className={row.correctOption === letter ? "is-correct" : ""}>
                <strong>{letter}.</strong> <MathText text={row[OPTION_KEYS[i]]} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="admin-form">
          <label>
            Question
            <textarea
              value={row.questionText}
              onChange={(e) => onChange({ questionText: e.target.value })}
              rows={2}
            />
          </label>
          {OPTION_KEYS.map((key, i) => (
            <label key={key}>
              {`Option ${OPTION_LETTERS[i]}`}
              <input value={row[key]} onChange={(e) => onChange({ [key]: e.target.value })} />
            </label>
          ))}
          <label>
            Correct option
            <select
              value={row.correctOption}
              onChange={(e) => onChange({ correctOption: e.target.value as CorrectOption })}
            >
              {OPTION_LETTERS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label>
            Marks
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={row.marks}
              onChange={(e) => onChange({ marks: Number(e.target.value) || row.marks })}
            />
          </label>
        </div>
      )}
    </div>
  );
}

export function AdminQuestionBankPage() {
  const { data: courses } = useCourses();
  const [courseId, setCourseId] = useState<number | null>(null);
  const { data: subjects } = useSubjects(courseId ?? NaN);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const { data: subject } = useSubject(subjectId ?? NaN);
  const [chapterId, setChapterId] = useState<number | null>(null);

  const { data: questions, isLoading } = useQuestions({
    subjectId: subjectId ?? undefined,
    chapterId: chapterId ?? undefined,
  });
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const dryRun = useUploadCsvDryRun();
  const confirmImport = useConfirmCsvImport();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [defaultMarks, setDefaultMarks] = useState("1");
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof dryRun.mutateAsync>> | null>(null);

  const [manualOpen, setManualOpen] = useState(false);
  const [form, setForm] = useState<QuestionFormState>(EMPTY_FORM);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<QuestionFormState>(EMPTY_FORM);

  async function handleFileSelected(file: File) {
    if (!chapterId) return;
    const result = await dryRun.mutateAsync({ chapterId, defaultMarks: Number(defaultMarks), file });
    setPreview(result);
  }

  function updateValidRow(index: number, patch: Partial<CsvValidRow>) {
    setPreview((prev) => {
      if (!prev) return prev;
      const validRows = prev.validRows.map((r, i) => (i === index ? { ...r, ...patch } : r));
      return { ...prev, validRows };
    });
  }

  function removeValidRow(index: number) {
    setPreview((prev) => {
      if (!prev) return prev;
      const validRows = prev.validRows.filter((_, i) => i !== index);
      return { ...prev, validRows, validCount: validRows.length };
    });
  }

  async function handleConfirmImport() {
    if (!subjectId || !chapterId || !preview) return;
    await confirmImport.mutateAsync({ subjectId, chapterId, rows: preview.validRows });
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleManualCreate(event: FormEvent) {
    event.preventDefault();
    if (!chapterId || !subjectId) return;
    await createQuestion.mutateAsync({
      chapterId,
      subjectId,
      questionText: form.questionText,
      optionA: form.optionA,
      optionB: form.optionB,
      optionC: form.optionC,
      optionD: form.optionD,
      correctOption: form.correctOption,
      marks: Number(form.marks),
      difficulty: form.difficulty || undefined,
      explanation: form.explanation || undefined,
    });
    setForm(EMPTY_FORM);
    setManualOpen(false);
  }

  function startEdit(q: Question) {
    setEditingId(q.id);
    setEditForm(questionToForm(q));
  }

  async function handleSaveEdit(event: FormEvent) {
    event.preventDefault();
    if (editingId === null) return;
    await updateQuestion.mutateAsync({
      id: editingId,
      input: {
        questionText: editForm.questionText,
        optionA: editForm.optionA,
        optionB: editForm.optionB,
        optionC: editForm.optionC,
        optionD: editForm.optionD,
        correctOption: editForm.correctOption,
        marks: Number(editForm.marks),
        difficulty: editForm.difficulty || undefined,
        explanation: editForm.explanation || undefined,
      },
    });
    setEditingId(null);
  }

  return (
    <section className="practice-page">
      <AdminPageHero
        icon="🗂"
        title="Question Bank"
        subtitle="Upload questions via CSV or add them one at a time — LaTeX math is supported everywhere, with a live preview before you save."
        stats={questions ? [{ label: "Questions in view", value: questions.length }] : undefined}
      />

      <div className="admin-panel">
        <h2 className="admin-section__heading">Choose where to work</h2>
        <div className="admin-form">
          <label>
            Course
            <select
              value={courseId ?? ""}
              onChange={(e) => {
                setCourseId(e.target.value ? Number(e.target.value) : null);
                setSubjectId(null);
                setChapterId(null);
                setPreview(null);
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
                  setPreview(null);
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
              <select
                value={chapterId ?? ""}
                onChange={(e) => {
                  setChapterId(e.target.value ? Number(e.target.value) : null);
                  setPreview(null);
                }}
              >
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
        <>
          <div className="qb-csv-upload admin-panel">
            <h2 className="admin-section__heading">Bulk upload via CSV</h2>
            <p className="course-meta">
              Every question in this upload will be added to <strong>{subject?.title}</strong> →{" "}
              <strong>{subject?.chapters?.find((c) => c.id === chapterId)?.title}</strong>. Cell text can
              contain LaTeX (e.g. <code>$x^2 + y^2 = r^2$</code>).
            </p>
            <div className="admin-form">
              <label>
                Default marks per question (used when the CSV doesn't specify its own "marks" column)
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={defaultMarks}
                  onChange={(e) => setDefaultMarks(e.target.value)}
                />
              </label>
              <p className="course-meta">
                CSV columns: question_text, option_a, option_b, option_c, option_d, correct_option,
                marks (optional), difficulty (optional), tags (optional), explanation (optional).
              </p>
              <label className="qb-file-label">
                CSV file
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFileSelected(file);
                  }}
                />
              </label>
            </div>

            {dryRun.isPending && <p>Validating...</p>}

            {preview && (
              <div className="qb-csv-preview">
                <p>
                  {preview.validCount} valid / {preview.invalidCount} invalid out of {preview.totalRows}{" "}
                  rows. Review and edit rows below (LaTeX renders live) before importing.
                </p>
                {preview.invalidRows.length > 0 && (
                  <ul className="qb-csv-preview__errors">
                    {preview.invalidRows.slice(0, 10).map((r) => (
                      <li key={r.row}>
                        Row {r.row}: {r.error}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="qb-csv-row-list">
                  {preview.validRows.map((row, i) => (
                    <CsvRowCard
                      key={i}
                      row={row}
                      index={i}
                      onChange={(patch) => updateValidRow(i, patch)}
                      onRemove={() => removeValidRow(i)}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={preview.validCount === 0 || confirmImport.isPending}
                  onClick={handleConfirmImport}
                >
                  {confirmImport.isPending ? "Importing..." : `Import ${preview.validCount} questions`}
                </button>
              </div>
            )}
          </div>

          <div className="qb-manual-add admin-panel">
            <button type="button" onClick={() => setManualOpen((v) => !v)} className="btn btn--ghost">
              {manualOpen ? "Cancel" : "+ Add a single question"}
            </button>

            {manualOpen && (
              <div className="qb-form-with-preview">
                <form onSubmit={handleManualCreate} className="admin-form">
                  <QuestionFormFields form={form} onChange={(patch) => setForm({ ...form, ...patch })} />
                  <button type="submit" className="btn btn--primary" disabled={createQuestion.isPending}>
                    {createQuestion.isPending ? "Adding..." : "Add question"}
                  </button>
                </form>
                <QuestionLivePreview form={form} />
              </div>
            )}
          </div>

          <div className="admin-panel">
            <h2 className="admin-section__heading">Questions in this chapter</h2>
            {isLoading && <p>Loading...</p>}

            <div className="qb-question-grid">
              {questions?.map((q) =>
                editingId === q.id ? (
                  <div key={q.id} className="qb-question-card qb-question-card--editing">
                    <div className="qb-form-with-preview">
                      <form onSubmit={handleSaveEdit} className="admin-form">
                        <QuestionFormFields
                          form={editForm}
                          onChange={(patch) => setEditForm({ ...editForm, ...patch })}
                        />
                        <div className="qb-question-card__actions">
                          <button type="submit" className="btn btn--primary" disabled={updateQuestion.isPending}>
                            {updateQuestion.isPending ? "Saving..." : "Save changes"}
                          </button>
                          <button type="button" className="btn btn--ghost" onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                      <QuestionLivePreview form={editForm} />
                    </div>
                  </div>
                ) : (
                  <div key={q.id} className="qb-question-card">
                    <p className="qb-question-card__text">
                      <MathText text={q.questionText} />
                    </p>
                    <ul className="qb-question-card__options">
                      {OPTION_LETTERS.map((letter, i) => (
                        <li key={letter} className={q.correctOption === letter ? "is-correct" : ""}>
                          <strong>{letter}.</strong> <MathText text={q[OPTION_KEYS[i]]} />
                        </li>
                      ))}
                    </ul>
                    <div className="qb-question-card__meta">
                      <span className="badge">{q.marks} marks</span>
                      {q.difficulty && <span className="badge">{q.difficulty}</span>}
                    </div>
                    <div className="qb-question-card__actions">
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => startEdit(q)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => {
                          if (confirm("Remove this question?")) deleteQuestion.mutate(q.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
              {questions?.length === 0 && <p>No questions yet.</p>}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
