import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { verifyJwt } from "../../middleware/auth";
import * as liveExamAttemptController from "./controller";

// Mounted at /api/live-exams — adds attempt-related routes alongside exam CRUD.
export const liveExamAttemptRouter = Router();

liveExamAttemptRouter.post("/:id/join", verifyJwt, asyncHandler(liveExamAttemptController.join));
liveExamAttemptRouter.get("/:id/leaderboard", asyncHandler(liveExamAttemptController.leaderboard));
liveExamAttemptRouter.put(
  "/attempts/:attemptId/answer",
  verifyJwt,
  asyncHandler(liveExamAttemptController.saveAnswer)
);
liveExamAttemptRouter.post(
  "/attempts/:attemptId/submit",
  verifyJwt,
  asyncHandler(liveExamAttemptController.submit)
);
liveExamAttemptRouter.get(
  "/attempts/:attemptId",
  verifyJwt,
  asyncHandler(liveExamAttemptController.getResult)
);
liveExamAttemptRouter.get(
  "/attempts/:attemptId/certificate",
  verifyJwt,
  asyncHandler(liveExamAttemptController.certificate)
);
