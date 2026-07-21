import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useDeleteStudent,
  useSetStudentSuspended,
  useStudentDetail,
  useUpdateStudent,
} from "../../../features/students/hooks";

export function AdminStudentDetailPage() {
  const { id } = useParams();
  const studentId = Number(id);
  const navigate = useNavigate();
  const { data: student, isLoading } = useStudentDetail(studentId);
  const updateStudent = useUpdateStudent(studentId);
  const setSuspended = useSetStudentSuspended();
  const deleteStudent = useDeleteStudent();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");

  useEffect(() => {
    if (student) {
      setName(student.name);
      setPhone(student.phone ?? "");
      setCollege(student.college ?? "");
    }
  }, [student]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await updateStudent.mutateAsync({ name, phone, college });
  }

  if (isLoading || !student) {
    return (
      <section>
        <p>Loading...</p>
      </section>
    );
  }

  return (
    <section>
      <Link to="/admin/students" className="btn btn--ghost" style={{ marginBottom: 12, display: "inline-block" }}>
        ← Back to students
      </Link>
      <h1>{student.name}</h1>
      <p className="course-meta">
        {student.email} · Joined {new Date(student.createdAt).toLocaleDateString()} ·{" "}
        <span className={`badge ${student.isActive ? "" : "badge--pending"}`}>
          {student.isActive ? "Active" : "Suspended"}
        </span>
      </p>

      {student.gamification && (
        <div className="dash-stats-grid dash-stats-grid--compact">
          <div className="dash-stat-card">
            <strong>{student.gamification.xp}</strong>
            <span>XP</span>
          </div>
          <div className="dash-stat-card">
            <strong>{student.gamification.coins}</strong>
            <span>Coins</span>
          </div>
          <div className="dash-stat-card">
            <strong>{student.gamification.currentStreak}</strong>
            <span>Current streak</span>
          </div>
          <div className="dash-stat-card">
            <strong>{student.gamification.longestStreak}</strong>
            <span>Best streak</span>
          </div>
        </div>
      )}

      <h2>Edit details</h2>
      <form onSubmit={handleSubmit} className="admin-form" style={{ maxWidth: 480 }}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
        </label>
        <label>
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} />
        </label>
        <label>
          College
          <input value={college} onChange={(e) => setCollege(e.target.value)} maxLength={200} />
        </label>
        <button type="submit" disabled={updateStudent.isPending}>
          {updateStudent.isPending ? "Saving..." : "Save changes"}
        </button>
      </form>

      <h2>Enrollments</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Course</th>
            <th>Status</th>
            <th>Requested</th>
          </tr>
        </thead>
        <tbody>
          {student.enrollments.map((e) => (
            <tr key={e.id}>
              <td>{e.courseTitle}</td>
              <td>
                <span className={`badge ${e.status === "approved" ? "" : "badge--pending"}`}>{e.status}</span>
              </td>
              <td>{new Date(e.requestedAt).toLocaleDateString()}</td>
            </tr>
          ))}
          {student.enrollments.length === 0 && (
            <tr>
              <td colSpan={3}>No enrollment requests yet.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
        <button
          type="button"
          onClick={() => setSuspended.mutate({ id: student.id, isActive: !student.isActive })}
        >
          {student.isActive ? "Suspend account" : "Reactivate account"}
        </button>
        <button
          type="button"
          onClick={async () => {
            if (confirm(`Delete ${student.name}? This cannot be undone.`)) {
              await deleteStudent.mutateAsync(student.id);
              navigate("/admin/students");
            }
          }}
        >
          Delete account
        </button>
      </div>
    </section>
  );
}
