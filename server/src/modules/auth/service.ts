import type { AdminRole, Role } from "../../config/enums";
import { db } from "../../config/db";
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

  await db
    .insertInto("refreshTokens")
    .values({
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiryDate(),
      deviceType: parseDeviceType(userAgent),
    })
    .execute();

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput, userAgent?: string) {
  const existing = await db.selectFrom("users").select("id").where("email", "=", input.email).executeTakeFirst();
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const result = await db
    .insertInto("users")
    .values({
      name: input.name,
      email: input.email,
      phone: input.phone,
      college: input.college,
      passwordHash,
      updatedAt: new Date(),
    })
    .executeTakeFirstOrThrow();
  const user = await db
    .selectFrom("users")
    .selectAll()
    .where("id", "=", Number(result.insertId))
    .executeTakeFirstOrThrow();

  const tokens = await issueTokenPair(user.id, user.role, userAgent);
  return { user: toPublicUser(user), ...tokens };
}

export async function login(input: LoginInput, userAgent?: string) {
  const user = await db.selectFrom("users").selectAll().where("email", "=", input.email).executeTakeFirst();
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
  const user = await db.selectFrom("users").selectAll().where("id", "=", userId).executeTakeFirst();
  if (!user || !user.isActive) throw new ApiError(401, "Account not found or inactive");
  const tokens = await issueTokenPair(user.id, user.role, userAgent);
  return { user: toPublicUser(user), ...tokens };
}

export async function refresh(rawToken: string | undefined, userAgent?: string) {
  if (!rawToken) {
    throw new ApiError(401, "Missing refresh token");
  }

  const tokenHash = hashToken(rawToken);
  const stored = await db
    .selectFrom("refreshTokens")
    .innerJoin("users", "users.id", "refreshTokens.userId")
    .selectAll("users")
    .select(["refreshTokens.id as sessionId", "refreshTokens.expiresAt as sessionExpiresAt"])
    .where("refreshTokens.tokenHash", "=", tokenHash)
    .where("refreshTokens.revokedAt", "is", null)
    .executeTakeFirst();

  if (!stored || stored.sessionExpiresAt < new Date()) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  // Rotate the token in place rather than revoking + inserting a new row — this is the
  // same "session" (same sign-in), so its identity (id/createdAt/deviceType) must not
  // change just because the access token was silently refreshed on a page load.
  const accessToken = signAccessToken({ sub: stored.id, role: stored.role });
  const newRawRefreshToken = generateRefreshToken();

  await db
    .updateTable("refreshTokens")
    .set({ tokenHash: hashToken(newRawRefreshToken), expiresAt: refreshExpiryDate() })
    .where("id", "=", stored.sessionId)
    .execute();

  return { user: toPublicUser(stored), accessToken, refreshToken: newRawRefreshToken };
}

export async function logout(rawToken: string | undefined) {
  if (!rawToken) return;
  const tokenHash = hashToken(rawToken);
  await db
    .updateTable("refreshTokens")
    .set({ revokedAt: new Date() })
    .where("tokenHash", "=", tokenHash)
    .where("revokedAt", "is", null)
    .execute();
}

export async function getMe(userId: number) {
  const user = await db.selectFrom("users").selectAll().where("id", "=", userId).executeTakeFirst();
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return toPublicUser(user);
}

export async function updateProfile(userId: number, input: UpdateProfileInput) {
  await db
    .updateTable("users")
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.college !== undefined ? { college: input.college } : {}),
      updatedAt: new Date(),
    })
    .where("id", "=", userId)
    .execute();
  const user = await db.selectFrom("users").selectAll().where("id", "=", userId).executeTakeFirstOrThrow();
  return toPublicUser(user);
}

export async function changePassword(userId: number, input: ChangePasswordInput) {
  const user = await db.selectFrom("users").selectAll().where("id", "=", userId).executeTakeFirst();
  if (!user) throw new ApiError(404, "User not found");

  const valid = await comparePassword(input.currentPassword, user.passwordHash);
  if (!valid) throw new ApiError(401, "Current password is incorrect");

  const passwordHash = await hashPassword(input.newPassword);
  await db.transaction().execute(async (trx) => {
    await trx.updateTable("users").set({ passwordHash, updatedAt: new Date() }).where("id", "=", userId).execute();
    await trx
      .updateTable("refreshTokens")
      .set({ revokedAt: new Date() })
      .where("userId", "=", userId)
      .where("revokedAt", "is", null)
      .execute();
  });
}

export async function listSessions(userId: number, currentRawToken: string | undefined) {
  const currentHash = currentRawToken ? hashToken(currentRawToken) : null;
  const sessions = await db
    .selectFrom("refreshTokens")
    .selectAll()
    .where("userId", "=", userId)
    .where("revokedAt", "is", null)
    .where("expiresAt", ">", new Date())
    .orderBy("createdAt", "desc")
    .execute();

  return sessions.map((s) => ({
    id: s.id,
    deviceType: s.deviceType ?? "unknown",
    createdAt: s.createdAt,
    expiresAt: s.expiresAt,
    isCurrent: currentHash !== null && s.tokenHash === currentHash,
  }));
}

export async function revokeSession(userId: number, sessionId: number) {
  const session = await db.selectFrom("refreshTokens").selectAll().where("id", "=", sessionId).executeTakeFirst();
  if (!session || session.userId !== userId) throw new ApiError(404, "Session not found");
  await db.updateTable("refreshTokens").set({ revokedAt: new Date() }).where("id", "=", sessionId).execute();
}

export async function forgotPassword(input: ForgotPasswordInput) {
  const user = await db.selectFrom("users").selectAll().where("email", "=", input.email).executeTakeFirst();
  // Always respond as if it succeeded so we don't leak which emails are registered.
  if (!user) return;

  const rawToken = generatePasswordResetToken();
  await db
    .insertInto("passwordResetTokens")
    .values({ userId: user.id, tokenHash: hashToken(rawToken), expiresAt: passwordResetExpiryDate() })
    .execute();

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
  const stored = await db
    .selectFrom("passwordResetTokens")
    .selectAll()
    .where("tokenHash", "=", tokenHash)
    .where("usedAt", "is", null)
    .executeTakeFirst();

  if (!stored || stored.expiresAt < new Date()) {
    throw new ApiError(400, "Invalid or expired reset link");
  }

  const passwordHash = await hashPassword(input.password);

  await db.transaction().execute(async (trx) => {
    await trx.updateTable("users").set({ passwordHash, updatedAt: new Date() }).where("id", "=", stored.userId).execute();
    await trx.updateTable("passwordResetTokens").set({ usedAt: new Date() }).where("id", "=", stored.id).execute();
    await trx
      .updateTable("refreshTokens")
      .set({ revokedAt: new Date() })
      .where("userId", "=", stored.userId)
      .where("revokedAt", "is", null)
      .execute();
  });
}
