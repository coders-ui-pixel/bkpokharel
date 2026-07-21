import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole, verifyJwt } from "../../middleware/auth";
import * as adminStatsController from "./controller";

export const adminStatsRouter = Router();

adminStatsRouter.use(verifyJwt, requireRole("admin"));
adminStatsRouter.get("/overview", asyncHandler(adminStatsController.getOverview));
