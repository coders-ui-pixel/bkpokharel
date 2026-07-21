import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { verifyJwt } from "../../middleware/auth";
import * as gamificationController from "./controller";

// Mounted at /api/gamification
export const gamificationRouter = Router();

gamificationRouter.use(verifyJwt);

gamificationRouter.get("/me", asyncHandler(gamificationController.me));
gamificationRouter.get("/leaderboard", asyncHandler(gamificationController.leaderboard));
