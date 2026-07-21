import { Request, Response } from "express";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { signTwoFactorPendingToken } from "../../services/tokenService";
import * as authService from "./service";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "./schema";

const REFRESH_COOKIE = "refreshToken";

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/auth",
};

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, refreshCookieOptions);
}

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.register(input, req.headers["user-agent"]);
  setRefreshCookie(res, refreshToken);
  res.status(201).json({ user, accessToken });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input, req.headers["user-agent"]);

  if (result.requiresTwoFactor) {
    const pendingToken = signTwoFactorPendingToken(result.userId);
    res.json({ requiresTwoFactor: true, pendingToken });
    return;
  }

  setRefreshCookie(res, result.refreshToken);
  res.json({ requiresTwoFactor: false, user: result.user, accessToken: result.accessToken });
}

export async function refresh(req: Request, res: Response) {
  const rawToken = req.cookies?.[REFRESH_COOKIE];
  const { user, accessToken, refreshToken } = await authService.refresh(rawToken, req.headers["user-agent"]);
  setRefreshCookie(res, refreshToken);
  res.json({ user, accessToken });
}

export async function logout(req: Request, res: Response) {
  const rawToken = req.cookies?.[REFRESH_COOKIE];
  await authService.logout(rawToken);
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }
  const user = await authService.getMe(req.user.id);
  res.json({ user });
}

export async function updateProfile(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const input = updateProfileSchema.parse(req.body);
  const user = await authService.updateProfile(req.user.id, input);
  res.json({ user });
}

export async function changePassword(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const input = changePasswordSchema.parse(req.body);
  await authService.changePassword(req.user.id, input);
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.status(204).send();
}

export async function listSessions(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const currentRawToken = req.cookies?.[REFRESH_COOKIE];
  const sessions = await authService.listSessions(req.user.id, currentRawToken);
  res.json({ sessions });
}

export async function revokeSession(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const sessionId = Number(req.params.id);
  await authService.revokeSession(req.user.id, sessionId);
  res.status(204).send();
}

export async function forgotPassword(req: Request, res: Response) {
  const input = forgotPasswordSchema.parse(req.body);
  await authService.forgotPassword(input);
  res.json({ message: "If that email is registered, a reset link has been sent." });
}

export async function resetPassword(req: Request, res: Response) {
  const input = resetPasswordSchema.parse(req.body);
  await authService.resetPassword(input);
  res.json({ message: "Password reset successfully." });
}
