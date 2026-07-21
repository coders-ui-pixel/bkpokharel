import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStudyTasks } from "../../features/studyPlanner/hooks";
import { useCalendarEventsForRange } from "../../features/calendarEvents/hooks";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

interface DayCell {
  date: Date;
  inCurrentMonth: boolean;
  isToday: boolean;
}

function buildMonthGrid(year: number, month: number): DayCell[] {
  const today = new Date();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    return {
      date,
      inCurrentMonth: date.getMonth() === month,
      isToday:
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate(),
    };
  });
}

export function AcademicCalendar() {
  const { data: tasks } = useStudyTasks();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const days = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor]);
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const rangeStart = useMemo(() => new Date(cursor.year, cursor.month, 1).toISOString(), [cursor]);
  const rangeEnd = useMemo(() => new Date(cursor.year, cursor.month + 1, 0).toISOString(), [cursor]);
  const { data: events } = useCalendarEventsForRange(rangeStart, rangeEnd);

  const taskDates = useMemo(() => {
    const set = new Set<string>();
    for (const task of tasks ?? []) {
      if (task.isDone) continue;
      set.add(dateKey(new Date(task.dueAt)));
    }
    return set;
  }, [tasks]);

  const eventDates = useMemo(() => {
    const set = new Set<string>();
    for (const event of events ?? []) {
      set.add(dateKey(new Date(event.occurrenceStart)));
    }
    return set;
  }, [events]);

  const upcoming = useMemo(() => {
    const now = new Date();
    const taskItems = (tasks ?? [])
      .filter((t) => !t.isDone && new Date(t.dueAt) >= now)
      .map((t) => ({ id: `task-${t.id}`, title: t.title, date: new Date(t.dueAt) }));
    const eventItems = (events ?? [])
      .filter((e) => new Date(e.occurrenceStart) >= now)
      .map((e) => ({ id: `event-${e.id}-${e.occurrenceStart}`, title: e.title, date: new Date(e.occurrenceStart) }));
    return [...taskItems, ...eventItems].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 4);
  }, [tasks, events]);

  function shiftMonth(delta: number) {
    setCursor((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  return (
    <div className="calendar-card">
      <div className="calendar-card__header">
        <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month">
          ‹
        </button>
        <strong>{monthLabel}</strong>
        <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month">
          ›
        </button>
      </div>
      <div className="calendar-card__weekdays">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="calendar-card__grid">
        {days.map(({ date, inCurrentMonth, isToday }) => (
          <div
            key={date.toISOString()}
            className={`calendar-card__day ${inCurrentMonth ? "" : "is-muted"} ${isToday ? "is-today" : ""}`}
          >
            {date.getDate()}
            {taskDates.has(dateKey(date)) && <span className="calendar-card__day-dot" />}
            {eventDates.has(dateKey(date)) && <span className="calendar-card__day-dot calendar-card__day-dot--event" />}
          </div>
        ))}
      </div>
      {upcoming.length > 0 ? (
        <ul className="calendar-card__upcoming">
          {upcoming.map((item) => (
            <li key={item.id}>
              <span>{item.title}</span>
              <span className="course-meta">
                {item.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="calendar-card__empty">
          No upcoming deadlines — <Link to="/dashboard/planner">add a study task</Link>.
        </p>
      )}
    </div>
  );
}
