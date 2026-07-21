import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordRequest } from "../../features/auth/api";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    try {
      await forgotPasswordRequest({ email });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-page__panel">
        <div className="auth-page__brand">
          <span className="auth-page__brand-icon">🔒</span>
          <span>MCQ Platform</span>
        </div>
        <h2>Forgot your password?</h2>
        <p>No worries — enter your email and we'll send you a secure link to reset it.</p>
        <ul className="auth-page__features">
          <li>The reset link is sent straight to your inbox</li>
          <li>Links expire after a short time for your security</li>
          <li>Your account and data stay fully protected</li>
        </ul>
      </div>

      <div className="auth-page__form">
        <div className="auth-form">
          <h1>Forgot password</h1>
          <p className="auth-form__subtitle">We'll email you a link to reset it.</p>

          {status === "sent" ? (
            <div className="auth-alert auth-alert--success">
              <span className="auth-alert__icon">✓</span>
              <span>If that email is registered, a reset link has been sent — check your inbox.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label>
                Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              {status === "error" && (
                <div className="auth-alert auth-alert--error">
                  <span className="auth-alert__icon">!</span>
                  <span>Something went wrong — please try again.</span>
                </div>
              )}
              <button type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}

          <p className="auth-form__footer">
            <Link to="/login">Back to log in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
