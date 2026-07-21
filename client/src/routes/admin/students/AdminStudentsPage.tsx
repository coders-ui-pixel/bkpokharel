import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";
import { useDeleteStudent, useSetStudentSuspended, useStudents } from "../../../features/students/hooks";
import { apiClient } from "../../../lib/apiClient";

export function AdminStudentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "suspended">("all");
  const { data: students, isLoading } = useStudents({
    search: search || undefined,
    status: status === "all" ? undefined : status,
  });
  const setSuspended = useSetStudentSuspended();
  const deleteStudent = useDeleteStudent();

  async function handleExport() {
    const { data } = await apiClient.get("/admin/students/export.csv", { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeCount = students?.filter((s) => s.isActive).length ?? 0;
  const suspendedCount = students?.filter((s) => !s.isActive).length ?? 0;

  return (
    <section className="practice-page">
      <AdminPageHero
        icon="👥"
        title="Students"
        subtitle="Search, review, and manage every student account on the platform."
        stats={
          students
            ? [
                { label: "Total", value: students.length },
                { label: "Active", value: activeCount },
                { label: "Suspended", value: suspendedCount },
              ]
            : undefined
        }
        action={
          <button type="button" className="btn" onClick={() => void handleExport()}>
            ⬇ Export CSV
          </button>
        }
      />

      <div className="admin-panel">
      <div className="admin-form admin-form--inline">
        <input
          type="search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="all">All students</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {isLoading && <p>Loading...</p>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Courses</th>
            <th>Attempts</th>
            <th>Status</th>
            <th>Joined</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {students?.map((s) => (
            <tr key={s.id}>
              <td>
                <Link to={`/admin/students/${s.id}`}>{s.name}</Link>
              </td>
              <td>{s.email}</td>
              <td>{s.enrollmentCount}</td>
              <td>{s.practiceAttemptCount + s.liveExamAttemptCount}</td>
              <td>
                <span className={`badge ${s.isActive ? "" : "badge--pending"}`}>
                  {s.isActive ? "Active" : "Suspended"}
                </span>
              </td>
              <td>{new Date(s.createdAt).toLocaleDateString()}</td>
              <td className="admin-table__actions">
                <button
                  type="button"
                  onClick={() => setSuspended.mutate({ id: s.id, isActive: !s.isActive })}
                >
                  {s.isActive ? "Suspend" : "Activate"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete ${s.name}? This cannot be undone.`)) deleteStudent.mutate(s.id);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {students?.length === 0 && (
            <tr>
              <td colSpan={7}>No students match this filter.</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </section>
  );
}
