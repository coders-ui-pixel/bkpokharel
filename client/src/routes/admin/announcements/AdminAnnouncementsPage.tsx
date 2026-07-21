import { useState } from "react";
import type { FormEvent } from "react";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";
import {
  useAllAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useUpdateAnnouncement,
} from "../../../features/announcements/hooks";
import type { AnnouncementType } from "../../../features/announcements/types";

function defaultStart(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultEnd(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminAnnouncementsPage() {
  const { data: announcements, isLoading } = useAllAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<AnnouncementType>("banner");
  const [startsAt, setStartsAt] = useState(defaultStart());
  const [endsAt, setEndsAt] = useState(defaultEnd());
  const [sendEmail, setSendEmail] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);
  const [result, setResult] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setResult(null);
    await createAnnouncement.mutateAsync({
      title,
      body,
      type,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      sendEmail,
      sendNotification,
    });
    setResult("Announcement published.");
    setTitle("");
    setBody("");
  }

  const activeCount = announcements?.filter((a) => a.isActive).length ?? 0;

  return (
    <section className="practice-page">
      <AdminPageHero
        icon="📣"
        title="Announcements"
        subtitle="Publish a site-wide banner or popup. Optionally also push it as an in-app notification and/or email."
        stats={
          announcements
            ? [
                { label: "Total", value: announcements.length },
                { label: "Active", value: activeCount },
              ]
            : undefined
        }
      />

      <div className="admin-panel">
      <form onSubmit={handleSubmit} className="admin-form" style={{ maxWidth: 560 }}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
        </label>
        <label>
          Message
          <textarea value={body} onChange={(e) => setBody(e.target.value)} required maxLength={2000} />
        </label>
        <label>
          Display as
          <select value={type} onChange={(e) => setType(e.target.value as AnnouncementType)}>
            <option value="banner">Banner (top of dashboard)</option>
            <option value="popup">Popup (modal, once per student)</option>
          </select>
        </label>
        <label>
          Active from
          <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
        </label>
        <label>
          Active until
          <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required />
        </label>
        <label className="admin-form__checkbox">
          <input type="checkbox" checked={sendNotification} onChange={(e) => setSendNotification(e.target.checked)} />
          Also send as an in-app notification to every student
        </label>
        <label className="admin-form__checkbox">
          <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
          Also email every student
        </label>
        <button type="submit" className="btn btn--primary" disabled={createAnnouncement.isPending}>
          {createAnnouncement.isPending ? "Publishing..." : "Publish announcement"}
        </button>
        {result && <p className="course-meta">{result}</p>}
      </form>
      </div>

      <div className="admin-panel">
      <h2>All announcements</h2>
      {isLoading && <p>Loading...</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Window</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {announcements?.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.type}</td>
              <td>
                {new Date(a.startsAt).toLocaleDateString()} – {new Date(a.endsAt).toLocaleDateString()}
              </td>
              <td>
                <span className={`badge ${a.isActive ? "" : "badge--pending"}`}>
                  {a.isActive ? "Active" : "Disabled"}
                </span>
              </td>
              <td>
                <div className="admin-table__actions">
                  <button
                    type="button"
                    onClick={() => updateAnnouncement.mutate({ id: a.id, input: { isActive: !a.isActive } })}
                  >
                    {a.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete "${a.title}"?`)) deleteAnnouncement.mutate(a.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {announcements?.length === 0 && (
            <tr>
              <td colSpan={5}>No announcements yet.</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </section>
  );
}
