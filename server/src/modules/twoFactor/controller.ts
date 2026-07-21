import { Request, Response } from "express";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import * as authService from "../auth/service";
import * as twoFactorService from "./service";
import { disableTwoFactorSchema, loginVerifySchema, verifyTwoFactorSetupSchema } from "./schema";

const REFRESH_COOKIE = "refreshToken";

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/auth",
};

export async function setup(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const me = await authService.getMe(req.user.id);
  const result = await twoFactorService.beginSetup(req.user.id, me.email);
  res.json(result);
}

export async function verifySetup(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const { token } = verifyTwoFactorSetupSchema.parse(req.body);
  await twoFactorService.confirmSetup(req.user.id, token);
  res.status(204).send();
}

export async function disable(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const { token } = disableTwoFactorSchema.parse(req.body);
  await twoFactorService.disable(req.user.id, token);
  res.status(204).send();
}

export async function loginVerify(req: Request, res: Response) {
  const { pendingToken, code } = loginVerifySchema.parse(req.body);
  const { user, accessToken, refreshToken } = await twoFactorService.verifyLogin(
    pendingToken,
    code,
    req.headers["user-agent"]
  );
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  res.json({ user, accessToken });
}
