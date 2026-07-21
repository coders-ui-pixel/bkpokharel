import { motion } from "framer-motion";
import { useSessions, useRevokeSession } from "../../../features/sessions/hooks";

const DEVICE_ICON: Record<string, string> = {
  mobile: "📱",
  desktop: "💻",
  tablet: "📱",
  unknown: "🖥",
};

export function DashboardSettingsPage() {
  const { data: sessions, isLoading } = useSessions();
  const revokeSession = useRevokeSession();

  return (
    <section className="practice-page">
      <div className="practice-hero practice-hero--settings">
        <div className="practice-hero__icon">⚙️</div>
        <div className="practice-hero__body">
          <h1>Settings</h1>
          <p>Manage the devices signed in to your account.</p>
        </div>
        {sessions && sessions.length > 0 && (
          <div className="practice-hero__stats">
            <div>
              <strong>{sessions.length}</strong>
              <span>Active sessions</span>
            </div>
          </div>
        )}
      </div>

      <div className="practice-chapter-block">
        <div className="practice-chapter-block__heading">
          <span>Active sessions</span>
        </div>

        {isLoading && <p>Loading...</p>}

        {!isLoading && (sessions?.length ?? 0) === 0 && (
          <div className="practice-empty-card">
            <span className="practice-empty-card__icon">💻</span>
            <p>No active sessions.</p>
          </div>
        )}

        <div className="session-grid">
          {sessions?.map((s, i) => (
            <motion.div
              key={s.id}
              className="session-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
            >
              <span className="session-card__icon">{DEVICE_ICON[s.deviceType] ?? "🖥"}</span>
              <div className="session-card__body">
                <strong>
                  {s.deviceType.charAt(0).toUpperCase() + s.deviceType.slice(1)}
                  {s.isCurrent && <span className="badge session-card__current">This device</span>}
                </strong>
                <span className="course-meta">Signed in {new Date(s.createdAt).toLocaleString()}</span>
                <span className="course-meta">Expires {new Date(s.expiresAt).toLocaleDateString()}</span>
              </div>
              {!s.isCurrent && (
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => revokeSession.mutate(s.id)}>
                  Revoke
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
