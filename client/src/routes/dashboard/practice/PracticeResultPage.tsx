import { useParams } from "react-router-dom";
import { MathText } from "../../../components/ui/MathText";
import { useAttempt } from "../../../features/attempts/hooks";

export function PracticeResultPage() {
  const { attemptId } = useParams();
  const { data: result, isLoading } = useAttempt(Number(attemptId));

  if (isLoading) return <p>Loading...</p>;
  if (!result) return <p>Attempt not found.</p>;

  return (
    <section className="practice-result">
      <h1>{result.questionSetTitle} — Result</h1>

      <div className="practice-result__summary">
        <div>
          <strong>{result.score}</strong>
          <span>Score / {result.totalMarks}</span>
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
          <strong>{result.unansweredCount}</strong>
          <span>Unanswered</span>
        </div>
      </div>

      <h2>Review</h2>
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
                  {isCorrectOpt && " ✓"}
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
