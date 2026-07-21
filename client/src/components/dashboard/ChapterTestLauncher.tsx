import { Link, useNavigate } from "react-router-dom";
import type { QuestionSet } from "../../features/questionSets/types";

export function ChapterTestLauncher({ sets }: { sets: QuestionSet[] }) {
  const navigate = useNavigate();

  if (sets.length === 0) return null;

  if (sets.length === 1) {
    return (
      <Link to={`/dashboard/practice/${sets[0].id}/run`} className="chapter-test-link">
        Take this chapter's test <span aria-hidden="true">→</span>
      </Link>
    );
  }

  return (
    <div className="chapter-test-picker">
      <select
        defaultValue=""
        aria-label="Choose which chapter test to take"
        onChange={(e) => {
          const value = e.target.value;
          if (value) navigate(`/dashboard/practice/${value}/run`);
        }}
      >
        <option value="" disabled>
          Take a chapter test ({sets.length} available)
        </option>
        {sets.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title} · {s._count?.items ?? 0} questions
          </option>
        ))}
      </select>
    </div>
  );
}
