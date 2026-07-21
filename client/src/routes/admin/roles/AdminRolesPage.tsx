import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useAdmins, useCreateAdmin, useDeleteAdmin, useUpdateAdminRole } from "../../../features/adminAccounts/hooks";
import type { AdminRole } from "../../../features/auth/types";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";
import { PasswordInput } from "../../../components/ui/PasswordInput";

const ROLE_LABEL: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  instructor: "Instructor",
  content_manager: "Content Manager",
  moderator: "Moderator",
};

const ROLE_DESCRIPTION: Record<AdminRole, string> = {
  super_admin: "Full access, including managing other admin accounts and roles.",
  admin: "Full operational access to courses, students, and content.",
  instructor: "Manages courses, questions, notes, and live exams.",
  content_manager: "Manages notes, flash cards, and important questions.",
  moderator: "Manages enrollment requests and announcements.",
};

export function AdminRolesPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.adminRole === "super_admin";
  const { data: admins, isLoading } = useAdmins();
  const createAdmin = useCreateAdmin();
  const updateRole = useUpdateAdminRole();
  const deleteAdmin = useDeleteAdmin();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminRole, setAdminRole] = useState<AdminRole>("moderator");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createAdmin.mutateAsync({ name, email, password, adminRole });
      setName("");
      setEmail("");
      setPassword("");
    } catch {
      setError("Could not create admin account — check the email isn't already in use.");
    }
  }

  return (
    <section className="practice-page">
      <AdminPageHero
        icon="🛡️"
        title="Roles & permissions"
        subtitle="Manage admin accounts and what each one can do. Only super admins can create admins or change roles."
        stats={[{ label: "Admin accounts", value: admins?.length ?? 0 }]}
      />

      {!isSuperAdmin && (
        <p className="badge badge--pending">
          You're viewing this read-only — only a super admin can make changes here.
        </p>
      )}

      {isSuperAdmin && (
        <div className="admin-panel">
          <h2 className="admin-section__heading">Create admin account</h2>
          <form onSubmit={handleSubmit} className="admin-form" style={{ maxWidth: 480 }}>
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
            </label>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Password
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </label>
            <label>
              Role
              <select value={adminRole} onChange={(e) => setAdminRole(e.target.value as AdminRole)}>
                {Object.entries(ROLE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <p className="course-meta">{ROLE_DESCRIPTION[adminRole]}</p>
            <button type="submit" className="btn btn--primary" disabled={createAdmin.isPending}>
              {createAdmin.isPending ? "Creating..." : "Create admin account"}
            </button>
            {error && <p className="form-error">{error}</p>}
          </form>
        </div>
      )}

      <div className="admin-panel">
        <h2 className="admin-section__heading">All admin accounts</h2>
        {isLoading && <p>Loading...</p>}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              {isSuperAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {admins?.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.email}</td>
                <td>
                  {isSuperAdmin ? (
                    <select
                      value={a.adminRole ?? "admin"}
                      onChange={(e) => updateRole.mutate({ id: a.id, adminRole: e.target.value as AdminRole })}
                    >
                      {Object.entries(ROLE_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    a.adminRole ? ROLE_LABEL[a.adminRole] : "—"
                  )}
                </td>
                <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                {isSuperAdmin && (
                  <td>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => {
                        if (confirm(`Remove admin access for ${a.name}?`)) deleteAdmin.mutate(a.id);
                      }}
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
