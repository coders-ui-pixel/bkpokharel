import { authenticator } from "otplib";
import QRCode from "qrcode";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { verifyTwoFactorPendingToken } from "../../services/tokenService";
import * as authAdapter from "../auth/service";

export async function beginSetup(userId: number, email: string) {
  const secret = authenticator.generateSecret();
  await prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret, twoFactorEnabled: false } });

  const otpauthUrl = authenticator.keyuri(email, "MCQ Platform", secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
  return { qrCodeDataUrl, secret };
}

export async function confirmSetup(userId: number, token: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.twoFactorSecret) throw new ApiError(400, "No pending 2FA setup found — start setup again");

  const valid = authenticator.check(token, user.twoFactorSecret);
  if (!valid) throw new ApiError(400, "Invalid verification code");

  await prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } });
}

export async function disable(userId: number, token: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.twoFactorSecret || !user.twoFactorEnabled) {
    throw new ApiError(400, "Two-factor authentication is not enabled");
  }

  const valid = authenticator.check(token, user.twoFactorSecret);
  if (!valid) throw new ApiError(400, "Invalid verification code");

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });
}

export async function verifyLogin(pendingToken: string, code: string, userAgent?: string) {
  let payload;
  try {
    payload = verifyTwoFactorPendingToken(pendingToken);
  } catch {
    throw new ApiError(401, "Invalid or expired verification session — please log in again");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user?.twoFactorSecret || !user.twoFactorEnabled) {
    throw new ApiError(400, "Two-factor authentication is not enabled for this account");
  }

  const valid = authenticator.check(code, user.twoFactorSecret);
  if (!valid) throw new ApiError(400, "Invalid verification code");

  return authAdapter.completeLoginAfterTwoFactor(user.id, userAgent);
}
