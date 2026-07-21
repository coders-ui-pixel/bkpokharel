import { AdminRole, Role } from "@prisma/client";
import { prisma } from "../../config/db";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { comparePassword, hashPassword } from "../../services/passwordService";
import { sendEmail } from "../../services/emailService";
import {
  generatePasswordResetToken,
  generateRefreshToken,
  hashToken,
  passwordResetExpiryDate,
  refreshExpiryDate,
  signAccessToken,
} from "../../services/tokenService";
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from "./schema";

function toPublicUser(user: {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  college: string | null;
  role: Role;
  adminRole: AdminRole | null;
  twoFactorEnabled: boolean;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    college: user.college,
    role: user.role,
    adminRole: user.adminRole,
    twoFactorEnabled: user.twoFactorEnabled,
    createdAt: user.createdAt,
  };
}

function parseDeviceType(userAgent: string | undefined): string {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/mobile|android|iphone/.test(ua)) return "mobile";
  return "desktop";
}

async function issueTokenPair(userId: number, role: Role, userAgent?: string) {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiryDate(),
      deviceType: parseDeviceType(userAgent),
    },
  });

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput, userAgent?: string) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      college: input.college,
      passwordHash,
    },
  });

  const tokens = await issueTokenPair(user.id, user.role, userAgent);
  return { user: toPublicUser(user), ...tokens };
}

export async function login(input: LoginInput, userAgent?: string) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid email or password");
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.twoFactorEnabled) {
    return { requiresTwoFactor: true as const, userId: user.id };
  }

  const tokens = await issueTokenPair(user.id, user.role, userAgent);
  return { requiresTwoFactor: false as const, user: toPublicUser(user), ...tokens };
}

export async function completeLoginAfterTwoFactor(userId: number, userAgent?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) throw new ApiError(401, "Account not found or inactive");
  const tokens = await issueTokenPair(user.id, user.role, userAgent);
  return { user: toPublicUser(user), ...tokens };
}

export async function refresh(rawToken: string | undefined, userAgent?: string) {
  if (!rawToken) {
    throw new ApiError(401, "Missing refresh token");
  }

  const tokenHash = hashToken(rawToken);
  const stored = await prisma.refreshToken.findFirst({
    where: { tokenHash, revokedAt: null },
    include: { user: true },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  // Rotate the token in place rather than revoking + inserting a new row — this is the
  // same "session" (same sign-in), so its identity (id/createdAt/deviceType) must not
  // change just because the access token was silently refreshed on a page load.
  const accessToken = signAccessToken({ sub: stored.user.id, role: stored.user.role });
  const newRawRefreshToken = generateRefreshToken();

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: {
      tokenHash: hashToken(newRawRefreshToken),
      expiresAt: refreshExpiryDate(),
    },
  });

  return { user: toPublicUser(stored.user), accessToken, refreshToken: newRawRefreshToken };
}

export async function logout(rawToken: string | undefined) {
  if (!rawToken) return;
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return toPublicUser(user);
}

export async function updateProfile(userId: number, input: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.college !== undefined ? { college: input.college } : {}),
    },
  });
  return toPublicUser(user);
}

export async function changePassword(userId: number, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found");

  const valid = await comparePassword(input.currentPassword, user.passwordHash);
  if (!valid) throw new ApiError(401, "Current password is incorrect");

  const passwordHash = await hashPassword(input.newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}

export async function listSessions(userId: number, currentRawToken: string | undefined) {
  const currentHash = currentRawToken ? hashToken(currentRawToken) : null;
  const sessions = await prisma.refreshToken.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  return sessions.map((s) => ({
    id: s.id,
    deviceType: s.deviceType ?? "unknown",
    createdAt: s.createdAt,
    expiresAt: s.expiresAt,
    isCurrent: currentHash !== null && s.tokenHash === currentHash,
  }));
}

export async function revokeSession(userId: number, sessionId: number) {
  const session = await prisma.refreshToken.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) throw new ApiError(404, "Session not found");
  await prisma.refreshToken.update({ where: { id: sessionId }, data: { revokedAt: new Date() } });
}

export async function forgotPassword(input: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  // Always respond as if it succeeded so we don't leak which emails are registered.
  if (!user) return;

  const rawToken = generatePasswordResetToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: passwordResetExpiryDate(),
    },
  });

  const resetUrl = `${env.CLIENT_ORIGIN}/reset-password?token=${rawToken}`;
  await sendEmail(
    user.email,
    "Reset your password",
    `<p>Hi ${user.name},</p>
     <p>Click the link below to reset your password. This link expires in ${env.PASSWORD_RESET_EXPIRES_IN}.</p>
     <p><a href="${resetUrl}">${resetUrl}</a></p>
     <p>If you didn't request this, you can safely ignore this email.</p>`
  );
}

export async function resetPassword(input: ResetPasswordInput) {
  const tokenHash = hashToken(input.token);
  const stored = await prisma.passwordResetToken.findFirst({
    where: { tokenHash, usedAt: null },
    include: { user: true },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw new ApiError(400, "Invalid or expired reset link");
  }

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({ where: { id: stored.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: stored.id }, data: { usedAt: new Date() } }),
    prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}
