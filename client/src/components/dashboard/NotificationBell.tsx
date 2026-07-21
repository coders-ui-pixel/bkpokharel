import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../../features/notifications/hooks";
import type { AppNotification } from "../../features/notifications/types";
import { SidebarIcon } from "./SidebarIcon";

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const { data } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleClick(notification: AppNotification) {
    if (!notification.isRead) markRead.mutate(notification.id);
    if (notification.link) {
      navigate(notification.link);
      setOpen(false);
    }
  }

  const unreadCount = data?.unreadCount ?? 0;
  const recent = (data?.notifications ?? []).slice(0, 6);

  return (
    <div className="notif-bell" ref={rootRef}>
      <button
        type="button"
        className="dash-topbar__icon-btn"
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
      >
        <SidebarIcon name="notifications" />
        {unreadCount > 0 && <span className="notif-bell__badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-bell__panel">
          <div className="notif-bell__panel-header">
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button type="button" onClick={() => markAllRead.mutate()}>
                Mark all read
              </button>
            )}
          </div>
          <div className="notif-bell__list">
            {recent.length === 0 && <p className="notif-bell__empty">You're all caught up.</p>}
            {recent.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`notif-bell__item notif-bell__item--${n.type} ${n.isRead ? "" : "is-unread"}`}
                onClick={() => handleClick(n)}
              >
                <span className="notif-bell__item-title">{n.title}</span>
                {n.body && <span className="notif-bell__item-body">{n.body}</span>}
                <span className="notif-bell__item-time">{timeAgo(n.createdAt)}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="notif-bell__view-all"
            onClick={() => {
              navigate("/dashboard/notifications");
              setOpen(false);
            }}
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
