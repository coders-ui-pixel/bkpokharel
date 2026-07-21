import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";
import { useLiveExams } from "../../../features/liveExams/hooks";
import { useLeaderboard } from "../../../features/liveExamAttempts/hooks";

export function AdminLiveExamRankingsPage() {
  const { data: exams } = useLiveExams();
  const [examId, setExamId] = useState<number | null>(null);
  const { data: rows, isLoading } = useLeaderboard(examId ?? NaN);

  return (
    <section className="practice-page">
      <AdminPageHero
        icon="🏆"
        title="Rankings & Certificates"
        subtitle="Pick a live exam to see the leaderboard and open a printable certificate for any participant."
        stats={rows && examId ? [{ label: "Participants", value: rows.length }] : undefined}
      />

      <div className="admin-panel">
      <div className="admin-form">
        <label>
          Live exam
          <select
            value={examId ?? ""}
            onChange={(e) => setExamId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Select an exam...</option>
            {exams?.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title} ({exam.status})
              </option>
            ))}
          </select>
        </label>
      </div>
      </div>

      {examId && (
        <div className="admin-panel">
          {isLoading && <p>Loading...</p>}
          <table className="admin-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows?.map((row) => (
                <tr key={row.rank}>
                  <td>#{row.rank}</td>
                  <td>{row.name}</td>
                  <td>{row.score}</td>
                  <td>{new Date(row.submittedAt).toLocaleString()}</td>
                  <td>
                    <Link to={`/dashboard/live-exams/certificate/${row.attemptId}`} target="_blank">
                      View certificate
                    </Link>
                  </td>
                </tr>
              ))}
              {rows?.length === 0 && (
                <tr>
                  <td colSpan={5}>No submissions yet for this exam.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
