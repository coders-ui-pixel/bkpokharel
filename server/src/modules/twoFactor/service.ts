import { authenticator } from "otplib";
import QRCode from "qrcode";
import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { verifyTwoFactorPendingToken } from "../../services/tokenService";
import * as authAdapter from "../auth/service";

export async function beginSetup(userId: number, email: string) {
  const secret = authenticator.generateSecret();
  await db
    .updateTable("users")
    .set({ twoFactorSecret: secret, twoFactorEnabled: false, updatedAt: new Date() })
    .where("id", "=", userId)
    .execute();

  const otpauthUrl = authenticator.keyuri(email, "MCQ Platform", secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
  return { qrCodeDataUrl, secret };
}

export async function confirmSetup(userId: number, token: string) {
  const user = await db.selectFrom("users").selectAll().where("id", "=", userId).executeTakeFirst();
  if (!user?.twoFactorSecret) throw new ApiError(400, "No pending 2FA setup found — start setup again");

  const valid = authenticator.check(token, user.twoFactorSecret);
  if (!valid) throw new ApiError(400, "Invalid verification code");

  await db
    .updateTable("users")
    .set({ twoFactorEnabled: true, updatedAt: new Date() })
    .where("id", "=", userId)
    .execute();
}

export async function disable(userId: number, token: string) {
  const user = await db.selectFrom("users").selectAll().where("id", "=", userId).executeTakeFirst();
  if (!user?.twoFactorSecret || !user.twoFactorEnabled) {
    throw new ApiError(400, "Two-factor authentication is not enabled");
  }

  const valid = authenticator.check(token, user.twoFactorSecret);
  if (!valid) throw new ApiError(400, "Invalid verification code");

  await db
    .updateTable("users")
    .set({ twoFactorEnabled: false, twoFactorSecret: null, updatedAt: new Date() })
    .where("id", "=", userId)
    .execute();
}

export async function verifyLogin(pendingToken: string, code: string, userAgent?: string) {
  let payload;
  try {
    payload = verifyTwoFactorPendingToken(pendingToken);
  } catch {
    throw new ApiError(401, "Invalid or expired verification session — please log in again");
  }

  const user = await db.selectFrom("users").selectAll().where("id", "=", payload.sub).executeTakeFirst();
  if (!user?.twoFactorSecret || !user.twoFactorEnabled) {
    throw new ApiError(400, "Two-factor authentication is not enabled for this account");
  }

  const valid = authenticator.check(code, user.twoFactorSecret);
  if (!valid) throw new ApiError(400, "Invalid verification code");

  return authAdapter.completeLoginAfterTwoFactor(user.id, userAgent);
}
