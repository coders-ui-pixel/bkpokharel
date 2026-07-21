import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useLiveExam } from "../../../features/liveExams/hooks";
import { useLeaderboard } from "../../../features/liveExamAttempts/hooks";

export function LeaderboardPage() {
  const { id } = useParams();
  const examId = Number(id);
  const { user } = useAuth();
  const { data: exam } = useLiveExam(examId);
  const { data: rows, isLoading } = useLeaderboard(examId);

  return (
    <section>
      <h1>Leaderboard — {exam?.title}</h1>
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
            <tr key={row.rank} className={row.name === user?.name ? "is-current-user" : ""}>
              <td>#{row.rank}</td>
              <td>{row.name}</td>
              <td>{row.score}</td>
              <td>{new Date(row.submittedAt).toLocaleString()}</td>
              <td>
                {row.name === user?.name && (
                  <Link to={`/dashboard/live-exams/certificate/${row.attemptId}`} target="_blank">
                    View certificate
                  </Link>
                )}
              </td>
            </tr>
          ))}
          {rows?.length === 0 && (
            <tr>
              <td colSpan={5}>No submissions yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
