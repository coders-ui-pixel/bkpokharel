import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { useGamificationLeaderboard, useGamificationProfile } from "../../../features/gamification/hooks";

function levelFromXp(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function DashboardProgressPage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useGamificationProfile();
  const { data: leaderboard } = useGamificationLeaderboard();

  if (isLoading || !profile) {
    return (
      <section className="practice-page">
        <div className="practice-hero practice-hero--progress">
          <div className="practice-hero__icon">🏆</div>
          <div className="practice-hero__body">
            <h1>Progress</h1>
            <p>Loading your stats...</p>
          </div>
        </div>
      </section>
    );
  }

  const level = levelFromXp(profile.xp);
  const xpIntoLevel = profile.xp % 100;
  const earnedCount = profile.badges.filter((b) => b.earned).length;

  return (
    <section className="practice-page">
      <div className="practice-hero practice-hero--progress">
        <div className="practice-hero__icon">🏆</div>
        <div className="practice-hero__body">
          <h1>Progress</h1>
          <p>Your XP, streaks, badges, and where you rank against everyone else.</p>
        </div>
        <div className="practice-hero__stats">
          <div>
            <strong>Lvl {level}</strong>
            <span>Level</span>
          </div>
          <div>
            <strong>#{profile.rank}</strong>
            <span>Global rank</span>
          </div>
          <div>
            <strong>{earnedCount}</strong>
            <span>Badges</span>
          </div>
        </div>
      </div>

      <div className="progress-hero">
        <div className="progress-hero__stat">
          <strong>Level {level}</strong>
          <div className="progress-hero__bar">
            <div className="progress-hero__bar-fill" style={{ width: `${xpIntoLevel}%` }} />
          </div>
          <span className="course-meta">{xpIntoLevel}/100 XP to next level</span>
        </div>
        <div className="progress-hero__pill">
          <span>⚡ {profile.xp}</span>
          <span className="course-meta">Total XP</span>
        </div>
        <div className="progress-hero__pill">
          <span>🪙 {profile.coins}</span>
          <span className="course-meta">Coins</span>
        </div>
        <div className="progress-hero__pill">
          <span>🔥 {profile.currentStreak}</span>
          <span className="course-meta">Day streak (best {profile.longestStreak})</span>
        </div>
      </div>

      <div className="practice-chapter-block">
        <div className="practice-chapter-block__heading">
          <span>Badges</span>
          <span className="practice-chapter-block__count">
            {earnedCount}/{profile.badges.length}
          </span>
        </div>
        <div className="badge-grid">
          {profile.badges.map((badge, i) => (
            <motion.div
              key={badge.key}
              className={`badge-tile ${badge.earned ? "is-earned" : "is-locked"}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
            >
              <span className="badge-tile__icon">{badge.icon}</span>
              <strong>{badge.label}</strong>
              <span className="course-meta">{badge.description}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="practice-chapter-block">
        <div className="practice-chapter-block__heading">
          <span>Leaderboard</span>
        </div>
        <div className="leaderboard-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>XP</th>
                <th>Streak</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard?.map((entry) => (
                <tr key={entry.rank} className={entry.name === user?.name ? "is-current-user" : ""}>
                  <td>
                    {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : `#${entry.rank}`}
                  </td>
                  <td>{entry.name}</td>
                  <td>{entry.xp}</td>
                  <td>{entry.currentStreak}</td>
                </tr>
              ))}
              {leaderboard?.length === 0 && (
                <tr>
                  <td colSpan={4}>No activity yet — start practicing to appear on the leaderboard.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
