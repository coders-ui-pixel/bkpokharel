import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { TwoFactorPrompt } from "../../components/ui/TwoFactorPrompt";
import { PasswordInput } from "../../components/ui/PasswordInput";

export function AdminLoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login({ email, password });
      if (result.requiresTwoFactor) {
        setPendingToken(result.pendingToken);
      }
    } catch {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  if (pendingToken) {
    return (
      <section className="auth-form admin-login">
        <h1>Two-factor verification</h1>
        <TwoFactorPrompt pendingToken={pendingToken} onSuccess={() => navigate("/admin", { replace: true })} />
      </section>
    );
  }

  return (
    <section className="auth-form admin-login">
      <h1>Admin portal</h1>
      <p className="course-meta">Sign in with an administrator account to continue.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="form-error">{error}</p>}
        {user && user.role !== "admin" && (
          <p className="form-error">
            You're logged in as {user.email}, which isn't an admin account. Sign in with an admin
            account above to continue.
          </p>
        )}
        <button type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </section>
  );
}
