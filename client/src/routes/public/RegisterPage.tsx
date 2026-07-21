import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PasswordInput } from "../../components/ui/PasswordInput";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register({ name, email, phone, college, password, confirmPassword });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not create account.");
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
        <h2>Create your account</h2>
        <p>Join for free and start practicing chapter-wise MCQs in minutes — no card required.</p>
        <ul className="auth-page__features">
          <li>Free to get started, upgrade only if you want a paid course</li>
          <li>Instant access to every chapter you enroll in</li>
          <li>A personal dashboard that tracks your progress</li>
        </ul>
      </div>

      <div className="auth-page__form">
        <div className="auth-form auth-form--wide">
          <h1>Sign up</h1>
          <p className="auth-form__subtitle">A few details and you're ready to start practicing.</p>
          <form onSubmit={handleSubmit}>
            <div className="auth-form__row">
              <label>
                Name
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
              <label>
                Phone number
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </label>
            </div>
            <div className="auth-form__row">
              <label>
                Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label>
                College
                <input value={college} onChange={(e) => setCollege(e.target.value)} required />
              </label>
            </div>
            <div className="auth-form__row">
              <label>
                Password
                <PasswordInput
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <label>
                Confirm password
                <PasswordInput
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </label>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Sign up"}
            </button>
          </form>
          <p className="auth-form__footer">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
