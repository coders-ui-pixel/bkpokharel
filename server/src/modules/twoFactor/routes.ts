import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole, verifyJwt } from "../../middleware/auth";
import { authRateLimiter } from "../../middleware/rateLimit";
import * as twoFactorController from "./controller";

// Mounted at /api/auth/2fa
export const twoFactorRouter = Router();

twoFactorRouter.post("/login-verify", authRateLimiter, asyncHandler(twoFactorController.loginVerify));
twoFactorRouter.post("/setup", verifyJwt, requireRole("admin"), asyncHandler(twoFactorController.setup));
twoFactorRouter.post(
  "/verify",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(twoFactorController.verifySetup)
);
twoFactorRouter.post(
  "/disable",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(twoFactorController.disable)
);
