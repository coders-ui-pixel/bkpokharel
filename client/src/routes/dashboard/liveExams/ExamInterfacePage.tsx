import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MathText } from "../../../components/ui/MathText";
import { useJoinLiveExam, useSaveAnswer, useSubmitLiveExam } from "../../../features/liveExamAttempts/hooks";
import type { CorrectOption } from "../../../features/questionBank/types";
import type { JoinLiveExamResult } from "../../../features/liveExamAttempts/types";

const PAGE_SIZE = 20;

type AnswerState = Record<number, CorrectOption | null>;
type FlagState = Record<number, boolean>;

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function ExamInterfacePage() {
  const { id } = useParams();
  const examId = Number(id);
  const navigate = useNavigate();
  const joinExam = useJoinLiveExam();
  const saveAnswer = useSaveAnswer();
  const submitExam = useSubmitLiveExam();

  const [session, setSession] = useState<JoinLiveExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [marked, setMarked] = useState<FlagState>({});
  const [visited, setVisited] = useState<FlagState>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const submittedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    joinExam.mutate(examId, {
      onSuccess: (result) => {
        if (cancelled) return;
        if (result.alreadySubmitted) {
          navigate(`/dashboard/live-exams/${examId}/result/${result.attemptId}`, { replace: true });
          return;
        }
        setSession(result);
        const initialAnswers: AnswerState = {};
        const initialMarked: FlagState = {};
        result.existingAnswers?.forEach((a) => {
          initialAnswers[a.questionId] = a.selectedOption;
          initialMarked[a.questionId] = a.markedForReview;
        });
        setAnswers(initialAnswers);
        setMarked(initialMarked);
        if (result.questions?.[0]) setVisited({ [result.questions[0].id]: true });

        const endMs = new Date(result.exam!.endsAt).getTime();
        const nowMs = new Date(result.serverNow!).getTime();
        setRemainingSeconds(Math.max(0, Math.floor((endMs - nowMs) / 1000)));
      },
      onError: (err: any) => {
        setError(err?.response?.data?.message ?? "Could not join this exam.");
      },
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  const questions = session?.questions ?? [];
  const currentQuestion = questions[currentIndex];

  const handleSubmit = useMemo(
    () => async () => {
      if (!session?.attempt || submittedRef.current) return;
      submittedRef.current = true;
      const result = await submitExam.mutateAsync({
        attemptId: session.attempt.id,
        answers: questions.map((q) => ({ questionId: q.id, selectedOption: answers[q.id] ?? null })),
      });
      navigate(`/dashboard/live-exams/${examId}/result/${result.id}`, { replace: true });
    },
    [session, submitExam, questions, answers, navigate, examId]
  );

  useEffect(() => {
    if (!session?.exam) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          void handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.exam]);

  function goTo(index: number) {
    if (index < 0 || index >= questions.length) return;
    setCurrentIndex(index);
    const q = questions[index];
    setVisited((prev) => (prev[q.id] ? prev : { ...prev, [q.id]: true }));
  }

  function selectOption(option: CorrectOption) {
    if (!currentQuestion || !session?.attempt) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));
    saveAnswer.mutate({
      attemptId: session.attempt.id,
      input: { questionId: currentQuestion.id, selectedOption: option },
    });
  }

  function clearResponse() {
    if (!currentQuestion || !session?.attempt) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: null }));
    saveAnswer.mutate({
      attemptId: session.attempt.id,
      input: { questionId: currentQuestion.id, selectedOption: null },
    });
  }

  function toggleMarkAndNext() {
    if (!currentQuestion || !session?.attempt) return;
    const next = !marked[currentQuestion.id];
    setMarked((prev) => ({ ...prev, [currentQuestion.id]: next }));
    saveAnswer.mutate({
      attemptId: session.attempt.id,
      input: { questionId: currentQuestion.id, markedForReview: next },
    });
    goTo(currentIndex + 1);
  }

  function saveAndNext() {
    goTo(currentIndex + 1);
  }

  if (error) return <p className="form-error">{error}</p>;
  if (!session || !currentQuestion) return <p>Loading exam...</p>;

  const attemptedCount = Object.values(answers).filter((v) => v !== null && v !== undefined).length;
  const markedCount = Object.values(marked).filter(Boolean).length;

  const paletteStart = Math.floor(currentIndex / PAGE_SIZE) * PAGE_SIZE;
  const totalPages = Math.ceil(questions.length / PAGE_SIZE);

  function questionState(qid: number, index: number) {
    if (marked[qid]) return "marked";
    if (answers[qid]) return "answered";
    if (visited[qid] || index === currentIndex) return "visited";
    return "not-visited";
  }

  return (
    <div className="exam-interface">
      <header className="exam-interface__header">
        <span className="exam-interface__title">{session.exam?.title}</span>
        <span className="exam-interface__timer">{formatTime(remainingSeconds)}</span>
        <div className="exam-interface__stats">
          <span>Attempted {attemptedCount}/{questions.length}</span>
          <span>Remaining {questions.length - attemptedCount}</span>
          <span>Marked {markedCount}</span>
          <span>Q{currentIndex + 1}</span>
          <button type="button" onClick={() => setPaletteOpen((v) => !v)}>
            {paletteOpen ? "Hide palette" : "Show palette"}
          </button>
        </div>
      </header>

      <div className="exam-interface__body">
        <div className="exam-interface__main">
          <div className="practice-question">
            <p className="practice-question__text">
              <strong>Q{currentIndex + 1}.</strong> <MathText text={currentQuestion.questionText} />
            </p>
            <div className="practice-question__options">
              {(["A", "B", "C", "D"] as const).map((opt) => (
                <label
                  key={opt}
                  className={`practice-option ${answers[currentQuestion.id] === opt ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name={`q-${currentQuestion.id}`}
                    checked={answers[currentQuestion.id] === opt}
                    onChange={() => selectOption(opt)}
                  />
                  <span><MathText text={currentQuestion[`option${opt}` as "optionA" | "optionB" | "optionC" | "optionD"]} /></span>
                </label>
              ))}
            </div>
          </div>

          <div className="exam-interface__nav">
            <button type="button" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0}>
              ← Previous
            </button>
            <button type="button" onClick={clearResponse}>
              Clear Response
            </button>
            <button type="button" onClick={toggleMarkAndNext}>
              Mark For Review & Next
            </button>
            <button type="button" className="btn btn--primary" onClick={saveAndNext}>
              Save & Next →
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                if (confirm("Submit the test now? You won't be able to change answers after this.")) {
                  void handleSubmit();
                }
              }}
              disabled={submitExam.isPending}
            >
              {submitExam.isPending ? "Submitting..." : "Submit Test"}
            </button>
          </div>
        </div>

        {paletteOpen && (
          <aside className="exam-palette">
            <div className="exam-palette__legend">
              <span><i className="dot dot--gray" /> Not visited</span>
              <span><i className="dot dot--blue" /> Visited</span>
              <span><i className="dot dot--green" /> Answered</span>
              <span><i className="dot dot--purple" /> Marked</span>
            </div>

            {totalPages > 1 && (
              <div className="exam-palette__pages">
                {Array.from({ length: totalPages }, (_, p) => (
                  <button
                    key={p}
                    type="button"
                    className={paletteStart === p * PAGE_SIZE ? "is-active" : ""}
                    onClick={() => goTo(p * PAGE_SIZE)}
                  >
                    {p * PAGE_SIZE + 1}-{Math.min((p + 1) * PAGE_SIZE, questions.length)}
                  </button>
                ))}
              </div>
            )}

            <div className="exam-palette__grid">
              {questions.slice(paletteStart, paletteStart + PAGE_SIZE).map((q, i) => {
                const index = paletteStart + i;
                return (
                  <button
                    key={q.id}
                    type="button"
                    className={`exam-palette__cell state-${questionState(q.id, index)} ${
                      index === currentIndex ? "is-current" : ""
                    }`}
                    onClick={() => goTo(index)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
