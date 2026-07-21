import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { verifyJwt } from "../../middleware/auth";
import { authRateLimiter } from "../../middleware/rateLimit";
import * as authController from "./controller";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, asyncHandler(authController.register));
authRouter.post("/login", authRateLimiter, asyncHandler(authController.login));
authRouter.post("/refresh", asyncHandler(authController.refresh));
authRouter.post("/logout", asyncHandler(authController.logout));
authRouter.get("/me", verifyJwt, asyncHandler(authController.me));
authRouter.put("/me", verifyJwt, asyncHandler(authController.updateProfile));
authRouter.put("/me/password", verifyJwt, asyncHandler(authController.changePassword));
authRouter.get("/sessions", verifyJwt, asyncHandler(authController.listSessions));
authRouter.delete("/sessions/:id", verifyJwt, asyncHandler(authController.revokeSession));
authRouter.post("/forgot-password", authRateLimiter, asyncHandler(authController.forgotPassword));
authRouter.post("/reset-password", authRateLimiter, asyncHandler(authController.resetPassword));
