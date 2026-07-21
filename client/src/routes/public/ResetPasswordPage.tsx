import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPasswordRequest } from "../../features/auth/api";
import { PasswordInput } from "../../components/ui/PasswordInput";

function ResetPasswordShell({ children }: { children: ReactNode }) {
  return (
    <section className="auth-page">
      <div className="auth-page__panel">
        <div className="auth-page__brand">
          <span className="auth-page__brand-icon">🔒</span>
          <span>MCQ Platform</span>
        </div>
        <h2>Set a new password</h2>
        <p>Choose a strong new password to get back into your account.</p>
        <ul className="auth-page__features">
          <li>Use at least 8 characters</li>
          <li>Mix letters, numbers and symbols for extra safety</li>
          <li>You'll be signed in with your new password right away</li>
        </ul>
      </div>
      <div className="auth-page__form">
        <div className="auth-form">{children}</div>
      </div>
    </section>
  );
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPasswordRequest({ token, password, confirmPassword });
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "This reset link is invalid or has expired.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <ResetPasswordShell>
        <h1>Reset password</h1>
        <div className="auth-alert auth-alert--error">
          <span className="auth-alert__icon">!</span>
          <span>
            Missing reset token. Request a new link from the{" "}
            <Link to="/forgot-password">forgot password page</Link>.
          </span>
        </div>
      </ResetPasswordShell>
    );
  }

  return (
    <ResetPasswordShell>
      <h1>Reset password</h1>
      <p className="auth-form__subtitle">Enter a new password for your account.</p>

      {done ? (
        <div className="auth-alert auth-alert--success">
          <span className="auth-alert__icon">✓</span>
          <span>Password reset — redirecting you to log in...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            New password
            <PasswordInput
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <label>
            Confirm new password
            <PasswordInput
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? "Resetting..." : "Reset password"}
          </button>
        </form>
      )}
    </ResetPasswordShell>
  );
}
