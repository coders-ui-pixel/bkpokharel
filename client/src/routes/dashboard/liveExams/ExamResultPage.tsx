import { Link, useParams } from "react-router-dom";
import { MathText } from "../../../components/ui/MathText";
import { useAttemptResult } from "../../../features/liveExamAttempts/hooks";

export function ExamResultPage() {
  const { id, attemptId } = useParams();
  const examId = Number(id);
  const { data: result, isLoading } = useAttemptResult(Number(attemptId));

  if (isLoading) return <p>Loading...</p>;
  if (!result) return <p>Result not found.</p>;

  const accuracy =
    result.correctCount + result.wrongCount > 0
      ? ((result.correctCount / (result.correctCount + result.wrongCount)) * 100).toFixed(1)
      : "0";
  const percentile =
    result.rank && result.totalParticipants
      ? (((result.totalParticipants - result.rank) / result.totalParticipants) * 100).toFixed(1)
      : null;
  const timeTakenMs = new Date(result.submittedAt).getTime() - new Date(result.startedAt).getTime();
  const timeTakenMinutes = Math.round(timeTakenMs / 60000);
  const negativeMarks = result.answers
    .filter((a) => a.isCorrect === false)
    .reduce((sum, a) => sum + Number(a.marksAwarded), 0);

  return (
    <section className="exam-result">
      <div className="exam-result__header">
        <h1>{result.examTitle} — Result</h1>
        <div className="exam-result__actions">
          <Link to={`/dashboard/live-exams/${examId}/leaderboard`} className="btn btn--ghost">
            View leaderboard
          </Link>
          <button type="button" className="btn btn--ghost" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="exam-result__summary">
        <div>
          <strong>{result.score}</strong>
          <span>Score / {result.totalMarks}</span>
        </div>
        <div>
          <strong>{result.rank ?? "—"}</strong>
          <span>Rank / {result.totalParticipants}</span>
        </div>
        <div>
          <strong>{accuracy}%</strong>
          <span>Accuracy</span>
        </div>
        <div>
          <strong>{timeTakenMinutes} min</strong>
          <span>Time taken</span>
        </div>
        <div>
          <strong>{result.correctCount + result.wrongCount}</strong>
          <span>Attempted</span>
        </div>
        <div>
          <strong>{result.correctCount}</strong>
          <span>Correct</span>
        </div>
        <div>
          <strong>{result.wrongCount}</strong>
          <span>Wrong</span>
        </div>
        <div>
          <strong>{negativeMarks.toFixed(2)}</strong>
          <span>Negative marks</span>
        </div>
        {percentile && (
          <div>
            <strong>{percentile}</strong>
            <span>Percentile</span>
          </div>
        )}
      </div>

      <div className="exam-result__analysis-grid">
        <div className="checkout-card">
          <h2>Subject-wise analysis</h2>
          {result.subjectAnalysis.map((row) => (
            <div key={row.label} className="analysis-row">
              <span>{row.label}</span>
              <span>
                {row.correct}/{row.total} correct
              </span>
            </div>
          ))}
        </div>
        <div className="checkout-card">
          <h2>Chapter-wise analysis</h2>
          {result.chapterAnalysis.map((row) => (
            <div key={row.label} className="analysis-row">
              <span>{row.label}</span>
              <span>
                {row.correct}/{row.total} correct
              </span>
            </div>
          ))}
        </div>
        <div className="checkout-card">
          <h2>Difficulty analysis</h2>
          {result.difficultyAnalysis.map((row) => (
            <div key={row.label} className="analysis-row">
              <span>{row.label}</span>
              <span>
                {row.correct}/{row.total} correct
              </span>
            </div>
          ))}
        </div>
      </div>

      <h2>Question review</h2>
      <div className="practice-review">
        {result.answers.map((a, index) => (
          <div
            key={a.questionId}
            className={`practice-review__item ${
              a.isCorrect === true ? "is-correct" : a.isCorrect === false ? "is-wrong" : "is-unanswered"
            }`}
          >
            <p className="practice-review__question">
              <strong>Q{index + 1}.</strong> <MathText text={a.questionText} />
            </p>
            {(["A", "B", "C", "D"] as const).map((opt) => {
              const text = a[`option${opt}` as "optionA" | "optionB" | "optionC" | "optionD"];
              const isCorrectOpt = opt === a.correctOption;
              const isSelected = opt === a.selectedOption;
              return (
                <p
                  key={opt}
                  className={`practice-review__option ${isCorrectOpt ? "is-correct-answer" : ""} ${
                    isSelected && !isCorrectOpt ? "is-wrong-answer" : ""
                  }`}
                >
                  {opt}. <MathText text={text} />
                  {isCorrectOpt && " ✓ (correct answer)"}
                  {isSelected && !isCorrectOpt && " (your answer)"}
                </p>
              );
            })}
            {a.explanation && (
              <p className="practice-review__explanation">
                <MathText text={a.explanation} />
              </p>
            )}
            <p className="course-meta">Marks: {a.marksAwarded}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
