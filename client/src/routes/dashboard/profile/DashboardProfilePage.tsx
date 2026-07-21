import { useState } from "react";
import type { FormEvent } from "react";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useMyEnrollments } from "../../../features/courses/hooks";
import { useMyAttempts } from "../../../features/attempts/hooks";
import { useGamificationProfile } from "../../../features/gamification/hooks";
import { changePasswordRequest, updateProfileRequest } from "../../../features/auth/api";
import { PasswordInput } from "../../../components/ui/PasswordInput";

export function DashboardProfilePage() {
  const { user, setUser, logout } = useAuth();
  const { data: enrollments } = useMyEnrollments();
  const { data: attempts } = useMyAttempts();
  const { data: gamification } = useGamificationProfile();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [college, setCollege] = useState(user?.college ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const approvedCount = enrollments?.filter((e) => e.status === "approved").length ?? 0;
  const attemptsCount = attempts?.length ?? 0;

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      const updated = await updateProfileRequest({ name, phone, college });
      setUser(updated);
      setProfileMessage("Profile updated.");
    } catch {
      setProfileMessage("Could not update profile. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage(null);
    try {
      await changePasswordRequest({ currentPassword, newPassword, confirmPassword });
      await logout();
      navigate("/login");
    } catch (err) {
      const message = isAxiosError<{ message?: string }>(err) ? err.response?.data?.message : null;
      setPasswordMessage(message ?? "Could not change password. Check your current password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <section className="practice-page">
      <div className="practice-hero practice-hero--profile">
        <div className="profile-hero__avatar">{user?.name?.[0]?.toUpperCase() ?? "?"}</div>
        <div className="practice-hero__body">
          <h1>{user?.name}</h1>
          <p>{user?.email}</p>
          {user?.createdAt && (
            <p className="profile-hero__since">
              Member since{" "}
              {new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </p>
          )}
        </div>
        <div className="practice-hero__stats">
          <div>
            <strong>{approvedCount}</strong>
            <span>Courses</span>
          </div>
          <div>
            <strong>{attemptsCount}</strong>
            <span>Attempts</span>
          </div>
          <div>
            <strong>{gamification?.xp ?? 0}</strong>
            <span>XP</span>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="planner-form-card">
          <h2>Edit profile</h2>
          <form onSubmit={handleProfileSubmit} className="admin-form" style={{ maxWidth: "none" }}>
            <label>
              Full name
              <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
            </label>
            <label>
              Email (cannot be changed)
              <input value={user?.email ?? ""} disabled />
            </label>
            <label>
              Phone
              <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} />
            </label>
            <label>
              College
              <input value={college} onChange={(e) => setCollege(e.target.value)} maxLength={200} />
            </label>
            <button type="submit" className="btn btn--primary" disabled={profileSaving}>
              {profileSaving ? "Saving..." : "Save changes"}
            </button>
            {profileMessage && <p className="course-meta">{profileMessage}</p>}
          </form>
        </div>

        <div className="planner-form-card">
          <h2>Change password</h2>
          <form onSubmit={handlePasswordSubmit} className="admin-form" style={{ maxWidth: "none" }}>
            <label>
              Current password
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </label>
            <label>
              New password
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </label>
            <label>
              Confirm new password
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </label>
            <button type="submit" className="btn btn--primary" disabled={passwordSaving}>
              {passwordSaving ? "Updating..." : "Change password"}
            </button>
            {passwordMessage && <p className="course-meta">{passwordMessage}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
