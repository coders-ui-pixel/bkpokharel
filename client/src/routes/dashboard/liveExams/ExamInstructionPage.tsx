import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLiveExam } from "../../../features/liveExams/hooks";

function formatDuration(startsAt: string, endsAt: string): string {
  const ms = new Date(endsAt).getTime() - new Date(startsAt).getTime();
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} minutes`;
  if (minutes === 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return `${hours}h ${minutes}m`;
}

const INSTRUCTIONS = [
  "Mobile phones and other unauthorized devices are prohibited during the exam.",
  "Do not refresh or close this page once the exam has started.",
  "A stable internet connection is required for the full duration of the exam.",
  "The timer starts immediately once you click \"Start Exam\" and cannot be paused.",
  "The exam auto-submits automatically when time runs out.",
  "You get one attempt only — it cannot be retaken.",
  "You can navigate between questions and change your answers until you submit.",
];

export function ExamInstructionPage() {
  const { id } = useParams();
  const examId = Number(id);
  const navigate = useNavigate();
  const { data: exam, isLoading } = useLiveExam(examId);
  const [acknowledged, setAcknowledged] = useState(false);

  if (isLoading) return <p>Loading...</p>;
  if (!exam) return <p>Exam not found.</p>;

  const negativeMarking = Number(exam.questionSet.negativeMarking);

  if (exam.status === "completed") {
    return (
      <section className="exam-instructions">
        <div className="exam-instructions__card">
          <h1>{exam.title}</h1>
          <p className="badge">This exam has ended</p>
          <button
            type="button"
            className="btn btn--primary btn--lg btn--block"
            onClick={() => navigate(`/dashboard/live-exams/${examId}/leaderboard`)}
          >
            View leaderboard →
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="exam-instructions">
      <div className="exam-instructions__card">
        <h1>{exam.title}</h1>

        <div className="exam-instructions__stats">
          <div>
            <strong>{formatDuration(exam.startsAt, exam.endsAt)}</strong>
            <span>Duration</span>
          </div>
          <div>
            <strong>{exam.questionSet._count?.items ?? 0}</strong>
            <span>Questions</span>
          </div>
          <div>
            <strong>{exam.totalMarks}</strong>
            <span>Marks</span>
          </div>
          <div>
            <strong>
              {negativeMarking > 0 ? `+1 / -${negativeMarking}` : "No negative marking"}
            </strong>
            <span>Marking scheme</span>
          </div>
        </div>

        {exam.status === "scheduled" && (
          <p className="badge badge--pending">
            Opens at {new Date(exam.startsAt).toLocaleString()}
          </p>
        )}

        <h2>Instructions</h2>
        <ul className="exam-instructions__list">
          {INSTRUCTIONS.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <label className="exam-instructions__ack">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
          />
          I have read all instructions
        </label>

        <button
          type="button"
          className="btn btn--primary btn--lg btn--block"
          disabled={!acknowledged || exam.status !== "live"}
          onClick={() => navigate(`/dashboard/live-exams/${examId}/take`)}
        >
          {exam.status === "live" ? "Start Exam →" : "Waiting for exam to start..."}
        </button>
      </div>
    </section>
  );
}
