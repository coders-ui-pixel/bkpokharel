import { useState } from "react";
import type { FormEvent } from "react";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";
import { useSendNotification } from "../../../features/notifications/hooks";
import type { NotificationType } from "../../../features/notifications/types";

export function AdminNotificationsPage() {
  const sendNotification = useSendNotification();
  const [target, setTarget] = useState<"broadcast" | "single">("broadcast");
  const [userEmail, setUserEmail] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<NotificationType>("info");
  const [link, setLink] = useState("");
  const [result, setResult] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setResult(null);
    const res = await sendNotification.mutateAsync({
      title,
      body: body || undefined,
      type,
      link: link || undefined,
      broadcast: target === "broadcast",
      userEmail: target === "single" ? userEmail : undefined,
    });
    setResult(`Sent to ${res.sentTo} student${res.sentTo === 1 ? "" : "s"}.`);
    setTitle("");
    setBody("");
    setLink("");
  }

  return (
    <section className="practice-page">
      <AdminPageHero
        icon="🔔"
        title="Notifications"
        subtitle="Send an in-app notification to a single student or broadcast to every student."
      />

      <div className="admin-panel">
      <form onSubmit={handleSubmit} className="admin-form" style={{ maxWidth: 520 }}>
        <label>
          Send to
          <select value={target} onChange={(e) => setTarget(e.target.value as "broadcast" | "single")}>
            <option value="broadcast">All students</option>
            <option value="single">Specific student (by email)</option>
          </select>
        </label>
        {target === "single" && (
          <label>
            Student email
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
          </label>
        )}
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
        </label>
        <label>
          Message (optional)
          <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} />
        </label>
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value as NotificationType)}>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </label>
        <label>
          Link (optional, e.g. /dashboard/courses)
          <input value={link} onChange={(e) => setLink(e.target.value)} maxLength={500} />
        </label>
        <button type="submit" className="btn btn--primary" disabled={sendNotification.isPending}>
          {sendNotification.isPending ? "Sending..." : "Send notification"}
        </button>
        {result && <p className="course-meta">{result}</p>}
      </form>
      </div>
    </section>
  );
}
