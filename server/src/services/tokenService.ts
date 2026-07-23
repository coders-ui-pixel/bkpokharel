import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { Role } from "../config/enums";

export interface AccessTokenPayload {
  sub: number;
  role: Role;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as unknown as AccessTokenPayload;
}

export interface TwoFactorPendingPayload {
  sub: number;
  purpose: "2fa-pending";
}

export function signTwoFactorPendingToken(userId: number): string {
  return jwt.sign({ sub: userId, purpose: "2fa-pending" }, env.JWT_ACCESS_SECRET, {
    expiresIn: "5m",
  });
}

export function verifyTwoFactorPendingToken(token: string): TwoFactorPendingPayload {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as unknown as TwoFactorPendingPayload;
  if (payload.purpose !== "2fa-pending") {
    throw new Error("Invalid token purpose");
  }
  return payload;
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function expiryDateFromDuration(duration: string, fallbackUnit: "d" | "h" = "d"): Date {
  const match = /^(\d+)([smhd])$/.exec(duration);
  const amount = match ? Number(match[1]) : 1;
  const unit = match ? match[2] : fallbackUnit;
  const unitMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return new Date(Date.now() + amount * (unitMs[unit] ?? unitMs.d));
}

export function refreshExpiryDate(): Date {
  return expiryDateFromDuration(env.JWT_REFRESH_EXPIRES_IN, "d");
}

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function passwordResetExpiryDate(): Date {
  return expiryDateFromDuration(env.PASSWORD_RESET_EXPIRES_IN, "h");
}
