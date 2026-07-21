import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import {
  useCreateStudyTask,
  useDeleteStudyTask,
  useStudyTasks,
  useUpdateStudyTask,
} from "../../../features/studyPlanner/hooks";
import type { StudyTask, StudyTaskPriority } from "../../../features/studyPlanner/types";

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultDueValue(): string {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return toLocalInputValue(d);
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function groupTasks(tasks: StudyTask[]) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const overdue: StudyTask[] = [];
  const today: StudyTask[] = [];
  const upcoming: StudyTask[] = [];
  const done: StudyTask[] = [];

  for (const task of tasks) {
    if (task.isDone) {
      done.push(task);
      continue;
    }
    const due = new Date(task.dueAt);
    if (due < now) overdue.push(task);
    else if (due < tomorrowStart) today.push(task);
    else upcoming.push(task);
  }

  return { overdue, today, upcoming, done };
}

const PRIORITY_LABEL: Record<StudyTaskPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function DashboardPlannerPage() {
  const { data: tasks, isLoading } = useStudyTasks();
  const createTask = useCreateStudyTask();
  const updateTask = useUpdateStudyTask();
  const deleteTask = useDeleteStudyTask();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueAt, setDueAt] = useState(defaultDueValue());
  const [priority, setPriority] = useState<StudyTaskPriority>("medium");

  const grouped = useMemo(() => groupTasks(tasks ?? []), [tasks]);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setNotes("");
    setDueAt(defaultDueValue());
    setPriority("medium");
  }

  function startEdit(task: StudyTask) {
    setEditingId(task.id);
    setTitle(task.title);
    setNotes(task.notes ?? "");
    setDueAt(toLocalInputValue(new Date(task.dueAt)));
    setPriority(task.priority);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const dueAtIso = new Date(dueAt).toISOString();
    if (editingId) {
      await updateTask.mutateAsync({
        id: editingId,
        input: { title, notes: notes || null, dueAt: dueAtIso, priority },
      });
    } else {
      await createTask.mutateAsync({ title, notes: notes || undefined, dueAt: dueAtIso, priority });
    }
    resetForm();
  }

  function toggleDone(task: StudyTask) {
    updateTask.mutate({ id: task.id, input: { isDone: !task.isDone } });
  }

  function renderTask(task: StudyTask, i: number) {
    const due = new Date(task.dueAt);
    return (
      <motion.li
        key={task.id}
        className={`planner-task planner-task--${task.priority}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
      >
        <label className="planner-task__check">
          <input type="checkbox" checked={task.isDone} onChange={() => toggleDone(task)} />
        </label>
        <div className="planner-task__body">
          <div className="planner-task__title-row">
            <span className={task.isDone ? "planner-task__title is-done" : "planner-task__title"}>
              {task.title}
            </span>
            <span className={`badge planner-priority-badge planner-priority-badge--${task.priority}`}>
              {PRIORITY_LABEL[task.priority]}
            </span>
          </div>
          {task.notes && <p className="course-meta">{task.notes}</p>}
          <p className="course-meta">
            {due.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ·{" "}
            {due.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="planner-task__actions">
          <button type="button" onClick={() => startEdit(task)}>
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Delete this task?")) deleteTask.mutate(task.id);
            }}
          >
            Delete
          </button>
        </div>
      </motion.li>
    );
  }

  const totalActive = (tasks?.length ?? 0) - grouped.done.length;

  return (
    <section className="practice-page">
      <div className="practice-hero practice-hero--planner">
        <div className="practice-hero__icon">🗓</div>
        <div className="practice-hero__body">
          <h1>Study Planner</h1>
          <p>Plan your revision, track deadlines, and stay on schedule.</p>
        </div>
        {tasks && tasks.length > 0 && (
          <div className="practice-hero__stats">
            <div>
              <strong>{totalActive}</strong>
              <span>Active</span>
            </div>
            <div>
              <strong>{grouped.overdue.length}</strong>
              <span>Overdue</span>
            </div>
            <div>
              <strong>{grouped.done.length}</strong>
              <span>Done</span>
            </div>
          </div>
        )}
      </div>

      <div className="planner-form-card">
        <h2>{editingId ? "Edit task" : "Add a new task"}</h2>
        <form onSubmit={handleSubmit} className="admin-form planner-form">
          <label>
            Task
            <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
          </label>
          <label>
            Notes (optional)
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />
          </label>
          <label>
            Due
            <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} required />
          </label>
          <label>
            Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value as StudyTaskPriority)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn btn--primary" disabled={createTask.isPending || updateTask.isPending}>
              {editingId ? "Save changes" : "Add task"}
            </button>
            {editingId && (
              <button type="button" className="btn btn--ghost" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {isLoading && <p>Loading...</p>}

      {!isLoading && (tasks?.length ?? 0) === 0 && (
        <div className="practice-empty-card">
          <span className="practice-empty-card__icon">🗓</span>
          <p>No tasks yet — add your first one above.</p>
        </div>
      )}

      {grouped.overdue.length > 0 && (
        <div className="practice-chapter-block">
          <div className="practice-chapter-block__heading">
            <span>⚠ Overdue</span>
            <span className="practice-chapter-block__count">{grouped.overdue.length}</span>
          </div>
          <ul className="planner-task-list">{grouped.overdue.map(renderTask)}</ul>
        </div>
      )}

      {grouped.today.length > 0 && (
        <div className="practice-chapter-block">
          <div className="practice-chapter-block__heading">
            <span>Today</span>
            <span className="practice-chapter-block__count">{grouped.today.length}</span>
          </div>
          <ul className="planner-task-list">{grouped.today.map(renderTask)}</ul>
        </div>
      )}

      {grouped.upcoming.length > 0 && (
        <div className="practice-chapter-block">
          <div className="practice-chapter-block__heading">
            <span>Upcoming</span>
            <span className="practice-chapter-block__count">{grouped.upcoming.length}</span>
          </div>
          <ul className="planner-task-list">{grouped.upcoming.map(renderTask)}</ul>
        </div>
      )}

      {grouped.done.length > 0 && (
        <div className="practice-chapter-block">
          <div className="practice-chapter-block__heading">
            <span>Completed</span>
            <span className="practice-chapter-block__count">{grouped.done.length}</span>
          </div>
          <ul className="planner-task-list">{grouped.done.map(renderTask)}</ul>
        </div>
      )}
    </section>
  );
}
