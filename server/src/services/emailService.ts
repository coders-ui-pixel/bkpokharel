import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter =
  env.GMAIL_USER && env.GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: env.GMAIL_USER, pass: env.GMAIL_APP_PASSWORD },
      })
    : null;

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!transporter) {
    console.log(
      `[email] GMAIL_USER/GMAIL_APP_PASSWORD not configured — logging email instead of sending.\n` +
        `  To: ${to}\n  Subject: ${subject}\n  Body: ${html}`
    );
    return;
  }

  await transporter.sendMail({
    from: env.GMAIL_USER,
    to,
    subject,
    html,
  });
}
