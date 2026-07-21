import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { verifyJwt } from "../../middleware/auth";
import * as attemptController from "./controller";

export const attemptRouter = Router();

attemptRouter.use(verifyJwt);
attemptRouter.post("/practice", asyncHandler(attemptController.startPractice));
attemptRouter.post("/:attemptId/submit", asyncHandler(attemptController.submitPractice));
attemptRouter.get("/me", asyncHandler(attemptController.listMine));
attemptRouter.get("/:id", asyncHandler(attemptController.getAttempt));
