import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole, verifyJwt } from "../../middleware/auth";
import * as flashcardController from "./controller";

// Mounted at /api/chapters/:chapterId/flashcards
export const flashcardChapterRouter = Router({ mergeParams: true });

flashcardChapterRouter.get("/", verifyJwt, asyncHandler(flashcardController.list));
flashcardChapterRouter.post(
  "/",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(flashcardController.create)
);

// Mounted at /api/flashcards
export const flashcardRouter = Router();

flashcardRouter.get("/course/:courseId", verifyJwt, asyncHandler(flashcardController.listForCourse));
flashcardRouter.delete("/:id", verifyJwt, requireRole("admin"), asyncHandler(flashcardController.remove));
flashcardRouter.put(
  "/:id/reorder",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(flashcardController.reorder)
);
flashcardRouter.put(
  "/:id/progress",
  verifyJwt,
  asyncHandler(flashcardController.updateProgress)
);
