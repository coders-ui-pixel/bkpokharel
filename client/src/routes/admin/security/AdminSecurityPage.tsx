import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  useBeginTwoFactorSetup,
  useConfirmTwoFactorSetup,
  useDisableTwoFactor,
} from "../../../features/twoFactor/hooks";
import { useRevokeSession, useSessions } from "../../../features/sessions/hooks";
import { useAuditLogs } from "../../../features/auditLogs/hooks";
import { AdminPageHero } from "../../../components/admin/AdminPageHero";

const DEVICE_ICON: Record<string, string> = {
  mobile: "📱",
  desktop: "💻",
  tablet: "📱",
  unknown: "🖥",
};

function TwoFactorSection() {
  const { user, setUser } = useAuth();
  const beginSetup = useBeginTwoFactorSetup();
  const confirmSetup = useConfirmTwoFactorSetup();
  const disable = useDisableTwoFactor();

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleBeginSetup() {
    setMessage(null);
    const result = await beginSetup.mutateAsync();
    setQrCodeDataUrl(result.qrCodeDataUrl);
  }

  async function handleConfirm(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    try {
      await confirmSetup.mutateAsync(confirmCode);
      setQrCodeDataUrl(null);
      setConfirmCode("");
      setMessage("Two-factor authentication enabled.");
      if (user) setUser({ ...user, twoFactorEnabled: true });
    } catch {
      setMessage("Invalid code — please try again.");
    }
  }

  async function handleDisable(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    try {
      await disable.mutateAsync(disableCode);
      setDisableCode("");
      setMessage("Two-factor authentication disabled.");
      if (user) setUser({ ...user, twoFactorEnabled: false });
    } catch {
      setMessage("Invalid code — please try again.");
    }
  }

  return (
    <div className="admin-panel">
      <h2 className="admin-section__heading">Two-factor authentication</h2>
      <p className="course-meta">
        Require a 6-digit authenticator code (Google Authenticator, Authy, etc.) in addition to your
        password when logging in.
      </p>
      <p>
        Status:{" "}
        <span className={`badge ${user?.twoFactorEnabled ? "" : "badge--pending"}`}>
          {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
        </span>
      </p>

      {!qrCodeDataUrl && (
        <>
          <button type="button" className="btn btn--primary" onClick={handleBeginSetup} disabled={beginSetup.isPending}>
            {beginSetup.isPending ? "Generating..." : "Set up two-factor authentication"}
          </button>
          <form onSubmit={handleDisable} className="admin-form--inline" style={{ marginTop: 12 }}>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Current 6-digit code"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
            />
            <button type="submit" disabled={disable.isPending || disableCode.length !== 6}>
              Disable 2FA
            </button>
          </form>
        </>
      )}

      {qrCodeDataUrl && (
        <div>
          <p>Scan this QR code with your authenticator app, then enter the code it generates:</p>
          <img src={qrCodeDataUrl} alt="2FA setup QR code" style={{ width: 200, height: 200 }} />
          <form onSubmit={handleConfirm} className="admin-form--inline">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ""))}
              required
            />
            <button type="submit" className="btn btn--primary" disabled={confirmSetup.isPending || confirmCode.length !== 6}>
              Confirm & enable
            </button>
          </form>
        </div>
      )}

      {message && <p className="course-meta">{message}</p>}
    </div>
  );
}

function SessionsSection() {
  const { data: sessions, isLoading } = useSessions();
  const revokeSession = useRevokeSession();

  return (
    <div className="admin-panel">
      <h2 className="admin-section__heading">Active sessions</h2>
      <p className="course-meta">Devices currently logged in to your account.</p>
      {isLoading && <p>Loading...</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Device</th>
            <th>Signed in</th>
            <th>Expires</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sessions?.map((s) => (
            <tr key={s.id}>
              <td>
                {DEVICE_ICON[s.deviceType] ?? "🖥"} {s.deviceType}
                {s.isCurrent && <span className="badge" style={{ marginLeft: 8 }}>This device</span>}
              </td>
              <td>{new Date(s.createdAt).toLocaleString()}</td>
              <td>{new Date(s.expiresAt).toLocaleDateString()}</td>
              <td>
                {!s.isCurrent && (
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => revokeSession.mutate(s.id)}>
                    Revoke
                  </button>
                )}
              </td>
            </tr>
          ))}
          {sessions?.length === 0 && (
            <tr>
              <td colSpan={4}>No active sessions.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AuditLogSection() {
  const { data: logs, isLoading } = useAuditLogs();

  return (
    <div className="admin-panel">
      <h2 className="admin-section__heading">Audit log</h2>
      <p className="course-meta">Recent sensitive admin actions across the platform.</p>
      {isLoading && <p>Loading...</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Admin</th>
            <th>Action</th>
            <th>Target</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          {logs?.map((l) => (
            <tr key={l.id}>
              <td>{l.admin.name}</td>
              <td>{l.action}</td>
              <td>
                {l.targetType}
                {l.targetId ? ` #${l.targetId}` : ""}
              </td>
              <td>{new Date(l.createdAt).toLocaleString()}</td>
            </tr>
          ))}
          {logs?.length === 0 && (
            <tr>
              <td colSpan={4}>No audit log entries yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function AdminSecurityPage() {
  return (
    <section className="practice-page">
      <AdminPageHero
        icon="🔒"
        title="Settings & security"
        subtitle="Two-factor authentication, active sessions, and the audit trail for sensitive admin actions."
      />
      <TwoFactorSection />
      <SessionsSection />
      <AuditLogSection />
    </section>
  );
}
