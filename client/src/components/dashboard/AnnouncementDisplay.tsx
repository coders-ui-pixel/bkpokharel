import { useEffect, useState } from "react";
import { useActiveAnnouncements } from "../../features/announcements/hooks";

const DISMISSED_KEY = "mcq-dismissed-announcements";

function getDismissedIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function dismiss(id: number) {
  const ids = getDismissedIds();
  if (!ids.includes(id)) {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids, id]));
  }
}

export function AnnouncementDisplay() {
  const { data: announcements } = useActiveAnnouncements();
  const [dismissedIds, setDismissedIds] = useState<number[]>(() => getDismissedIds());

  useEffect(() => {
    setDismissedIds(getDismissedIds());
  }, [announcements]);

  const visible = (announcements ?? []).filter((a) => !dismissedIds.includes(a.id));
  const banners = visible.filter((a) => a.type === "banner");
  const popup = visible.find((a) => a.type === "popup");

  function handleDismiss(id: number) {
    dismiss(id);
    setDismissedIds((prev) => [...prev, id]);
  }

  return (
    <>
      {banners.map((a) => (
        <div key={a.id} className="announcement-banner">
          <span>
            <strong>{a.title}</strong> — {a.body}
          </span>
          <button type="button" onClick={() => handleDismiss(a.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}

      {popup && (
        <div className="announcement-popup-overlay">
          <div className="announcement-popup">
            <h2>{popup.title}</h2>
            <p>{popup.body}</p>
            <button type="button" className="btn btn--primary" onClick={() => handleDismiss(popup.id)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
