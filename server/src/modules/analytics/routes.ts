import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole, verifyJwt } from "../../middleware/auth";
import * as analyticsController from "./controller";

// Mounted at /api/admin/analytics
export const analyticsRouter = Router();

analyticsRouter.use(verifyJwt, requireRole("admin"));

analyticsRouter.get("/overview", asyncHandler(analyticsController.overview));
analyticsRouter.get("/weak-chapters", asyncHandler(analyticsController.weakChapters));
analyticsRouter.get("/devices", asyncHandler(analyticsController.devices));
