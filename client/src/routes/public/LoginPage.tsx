import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { TwoFactorPrompt } from "../../components/ui/TwoFactorPrompt";
import { PasswordInput } from "../../components/ui/PasswordInput";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login({ email, password });
      if (result.requiresTwoFactor) {
        setPendingToken(result.pendingToken);
      } else {
        navigate("/dashboard");
      }
    } catch {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-page__panel">
        <div className="auth-page__brand">
          <span className="auth-page__brand-icon">🎓</span>
          <span>MCQ Platform</span>
        </div>
        <h2>Welcome back</h2>
        <p>Pick up right where you left off — your courses, progress, and streak are waiting.</p>
        <ul className="auth-page__features">
          <li>Unlimited chapter-wise MCQ practice</li>
          <li>Live exams with a synced countdown and leaderboard</li>
          <li>Track XP, streaks, and badges as you learn</li>
        </ul>
      </div>

      <div className="auth-page__form">
        {pendingToken ? (
          <div className="auth-form">
            <h1>Two-factor verification</h1>
            <p className="auth-form__subtitle">Enter the 6-digit code from your authenticator app.</p>
            <TwoFactorPrompt pendingToken={pendingToken} onSuccess={() => navigate("/dashboard")} />
          </div>
        ) : (
          <div className="auth-form">
            <h1>Log in</h1>
            <p className="auth-form__subtitle">Enter your details to access your dashboard.</p>
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
              <button type="submit" disabled={submitting}>
                {submitting ? "Logging in..." : "Log in"}
              </button>
            </form>
            <p className="auth-form__footer">
              <Link to="/forgot-password">Forgot password?</Link> · No account?{" "}
              <Link to="/register">Sign up</Link>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
