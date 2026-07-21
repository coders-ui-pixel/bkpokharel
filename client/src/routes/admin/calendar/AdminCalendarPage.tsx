import { useState } from "react";
import type { FormEvent } from "react";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";
import { useCourses } from "../../../features/courses/hooks";
import {
  useAllCalendarEvents,
  useCreateCalendarEvent,
  useDeleteCalendarEvent,
} from "../../../features/calendarEvents/hooks";
import type { CalendarEventType, RecurrenceFrequency } from "../../../features/calendarEvents/types";

function defaultDateTime(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const TYPE_LABEL: Record<CalendarEventType, string> = {
  class: "Class",
  exam: "Exam",
  holiday: "Holiday",
  other: "Other",
};

export function AdminCalendarPage() {
  const { data: courses } = useCourses();
  const { data: events, isLoading } = useAllCalendarEvents();
  const createEvent = useCreateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CalendarEventType>("other");
  const [startsAt, setStartsAt] = useState(defaultDateTime(0));
  const [endsAt, setEndsAt] = useState(defaultDateTime(0));
  const [courseId, setCourseId] = useState<number | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>("weekly");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(defaultDateTime(30));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await createEvent.mutateAsync({
      title,
      description: description || undefined,
      type,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      isRecurring,
      recurrenceFrequency: isRecurring ? recurrenceFrequency : undefined,
      recurrenceEndDate: isRecurring ? new Date(recurrenceEndDate).toISOString() : undefined,
      courseId: courseId ?? undefined,
    });
    setTitle("");
    setDescription("");
  }

  return (
    <section className="practice-page">
      <AdminPageHero
        icon="🗓"
        title="Calendar Management"
        subtitle="Schedule classes, exams, and holidays. Platform-wide events show on every student's calendar; course-scoped events only show for enrolled students."
        stats={events ? [{ label: "Total events", value: events.length }] : undefined}
      />

      <div className="admin-panel">
      <form onSubmit={handleSubmit} className="admin-form" style={{ maxWidth: 560 }}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
        </label>
        <label>
          Description (optional)
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} />
        </label>
        <label>
          Type
          <select value={type} onChange={(e) => setType(e.target.value as CalendarEventType)}>
            <option value="class">Class</option>
            <option value="exam">Exam</option>
            <option value="holiday">Holiday</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>
          Course (optional — leave blank for platform-wide)
          <select value={courseId ?? ""} onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">Platform-wide</option>
            {courses?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Starts at
          <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
        </label>
        <label>
          Ends at
          <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required />
        </label>
        <label className="admin-form__checkbox">
          <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
          Recurring event
        </label>
        {isRecurring && (
          <>
            <label>
              Repeats
              <select
                value={recurrenceFrequency}
                onChange={(e) => setRecurrenceFrequency(e.target.value as RecurrenceFrequency)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
            <label>
              Until
              <input
                type="datetime-local"
                value={recurrenceEndDate}
                onChange={(e) => setRecurrenceEndDate(e.target.value)}
                required
              />
            </label>
          </>
        )}
        <button type="submit" className="btn btn--primary" disabled={createEvent.isPending}>
          {createEvent.isPending ? "Creating..." : "Create event"}
        </button>
      </form>
      </div>

      <div className="admin-panel">
      <h2>All events</h2>
      {isLoading && <p>Loading...</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Scope</th>
            <th>Starts</th>
            <th>Recurs</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {events?.map((e) => (
            <tr key={e.id}>
              <td>{e.title}</td>
              <td>{TYPE_LABEL[e.type]}</td>
              <td>{e.course?.title ?? "Platform-wide"}</td>
              <td>{new Date(e.startsAt).toLocaleString()}</td>
              <td>{e.isRecurring ? `${e.recurrenceFrequency} until ${new Date(e.recurrenceEndDate!).toLocaleDateString()}` : "No"}</td>
              <td>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete "${e.title}"?`)) deleteEvent.mutate(e.id);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {events?.length === 0 && (
            <tr>
              <td colSpan={6}>No calendar events yet.</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </section>
  );
}
