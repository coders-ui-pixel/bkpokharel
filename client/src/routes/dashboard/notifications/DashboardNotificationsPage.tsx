import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../../../features/notifications/hooks";
import type { AppNotification } from "../../../features/notifications/types";

const TYPE_ICON: Record<string, string> = {
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
  error: "🚫",
};

export function DashboardNotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const navigate = useNavigate();

  function handleClick(notification: AppNotification) {
    if (!notification.isRead) markRead.mutate(notification.id);
    if (notification.link) navigate(notification.link);
  }

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <section className="practice-page">
      <div className="practice-hero practice-hero--notifications">
        <div className="practice-hero__icon">🔔</div>
        <div className="practice-hero__body">
          <h1>Notifications</h1>
          <p>Enrollment updates, announcements, and everything else that needs your attention.</p>
        </div>
        {(data?.notifications.length ?? 0) > 0 && (
          <div className="practice-hero__stats">
            <div>
              <strong>{data?.notifications.length ?? 0}</strong>
              <span>Total</span>
            </div>
            <div>
              <strong>{unreadCount}</strong>
              <span>Unread</span>
            </div>
          </div>
        )}
      </div>

      {unreadCount > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button type="button" className="btn btn--ghost" onClick={() => markAllRead.mutate()}>
            Mark all read
          </button>
        </div>
      )}

      {isLoading && <p>Loading...</p>}
      {!isLoading && (data?.notifications.length ?? 0) === 0 && (
        <div className="practice-empty-card">
          <span className="practice-empty-card__icon">🔔</span>
          <p>You're all caught up — no notifications yet.</p>
        </div>
      )}

      <ul className="notif-page-list">
        {data?.notifications.map((n, i) => (
          <motion.li
            key={n.id}
            className={`notif-page-item notif-page-item--${n.type} ${n.isRead ? "" : "is-unread"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
          >
            <button type="button" onClick={() => handleClick(n)} disabled={!n.link}>
              <span className="notif-page-item__icon">{TYPE_ICON[n.type] ?? "ℹ️"}</span>
              <div className="notif-page-item__body">
                <div className="notif-page-item__title-row">
                  <span>{n.title}</span>
                  <span className="course-meta">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                {n.body && <p className="course-meta">{n.body}</p>}
              </div>
              {!n.isRead && <span className="notif-page-item__dot" aria-hidden="true" />}
            </button>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
