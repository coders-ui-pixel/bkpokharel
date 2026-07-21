import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MathText } from "../../../components/ui/MathText";
import { useStartPractice, useSubmitPractice } from "../../../features/attempts/hooks";
import type { CorrectOption } from "../../../features/questionBank/types";
import type { StartPracticeResult } from "../../../features/attempts/types";

export function PracticeRunnerPage() {
  const { questionSetId } = useParams();
  const setId = Number(questionSetId);
  const navigate = useNavigate();
  const startPractice = useStartPractice();
  const submitPractice = useSubmitPractice();

  const [session, setSession] = useState<StartPracticeResult | null>(null);
  const [answers, setAnswers] = useState<Record<number, CorrectOption | null>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    startPractice.mutate(setId, {
      onSuccess: (result) => {
        if (cancelled) return;
        setSession(result);
        setAnswers((prev) => {
          const next = { ...prev };
          result.questions.forEach((q) => {
            if (!(q.id in next)) next[q.id] = null;
          });
          return next;
        });
      },
      onError: () => setError("Could not start this practice set."),
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId]);

  async function handleSubmit() {
    if (!session) return;
    const result = await submitPractice.mutateAsync({
      attemptId: session.attempt.id,
      answers: session.questions.map((q) => ({ questionId: q.id, selectedOption: answers[q.id] ?? null })),
    });
    navigate(`/dashboard/practice/attempts/${result.id}`);
  }

  if (error) return <p className="form-error">{error}</p>;
  if (!session) return <p>Loading practice set...</p>;

  const answeredCount = Object.values(answers).filter((v) => v !== null).length;

  return (
    <section className="practice-runner">
      <div className="practice-runner__header">
        <h1>Practice</h1>
        <span className="course-meta">
          {answeredCount} / {session.questions.length} answered
        </span>
      </div>

      <div className="practice-runner__questions">
        {session.questions.map((q, index) => (
          <div key={q.id} className="practice-question">
            <p className="practice-question__text">
              <strong>Q{index + 1}.</strong> <MathText text={q.questionText} />
            </p>
            <div className="practice-question__options">
              {(["A", "B", "C", "D"] as const).map((opt) => (
                <label
                  key={opt}
                  className={`practice-option ${answers[q.id] === opt ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === opt}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                  />
                  <span><MathText text={q[`option${opt}` as "optionA" | "optionB" | "optionC" | "optionD"]} /></span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn btn--primary btn--lg btn--block"
        onClick={handleSubmit}
        disabled={submitPractice.isPending}
      >
        {submitPractice.isPending ? "Submitting..." : "Submit practice"}
      </button>
    </section>
  );
}
