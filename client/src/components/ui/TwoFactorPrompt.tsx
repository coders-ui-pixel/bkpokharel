import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";

export function TwoFactorPrompt({
  pendingToken,
  onSuccess,
}: {
  pendingToken: string;
  onSuccess: () => void;
}) {
  const { verifyTwoFactorLogin } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await verifyTwoFactorLogin(pendingToken, code);
      onSuccess();
    } catch {
      setError("Invalid or expired code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Authenticator code
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          required
          autoFocus
        />
      </label>
      <p className="course-meta">Enter the 6-digit code from your authenticator app.</p>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" disabled={submitting || code.length !== 6}>
        {submitting ? "Verifying..." : "Verify"}
      </button>
    </form>
  );
}
