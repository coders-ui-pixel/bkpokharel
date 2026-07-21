import { useState } from "react";
import type { FormEvent } from "react";
import { sendContactMessage } from "../../features/contact/api";

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    try {
      await sendContactMessage({ name, email, message });
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="auth-form">
      <h1>Contact us</h1>
      <p className="course-meta">
        Questions, feedback, or found a bug? Send us a message and we'll get back to you.
      </p>

      {status === "sent" ? (
        <p className="badge">Thanks — your message has been sent.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Message
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
            />
          </label>
          {status === "error" && <p className="form-error">Something went wrong — please try again.</p>}
          <button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending..." : "Send message"}
          </button>
        </form>
      )}
    </section>
  );
}
