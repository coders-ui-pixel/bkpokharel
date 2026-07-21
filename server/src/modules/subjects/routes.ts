import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole, verifyJwt } from "../../middleware/auth";
import * as subjectController from "./controller";
import { chapterRouter } from "../chapters/routes";

// Mounted at /api/courses/:courseId/subjects
export const subjectRouter = Router({ mergeParams: true });

subjectRouter.get("/", asyncHandler(subjectController.list));
subjectRouter.post("/", verifyJwt, requireRole("admin"), asyncHandler(subjectController.create));
subjectRouter.put("/:id", verifyJwt, requireRole("admin"), asyncHandler(subjectController.update));
subjectRouter.delete("/:id", verifyJwt, requireRole("admin"), asyncHandler(subjectController.remove));

// Mounted at /api/subjects (top-level, for the subject library + direct lookup + nested chapters)
export const subjectDetailRouter = Router();

subjectDetailRouter.get("/", verifyJwt, requireRole("admin"), asyncHandler(subjectController.listAll));
subjectDetailRouter.post("/", verifyJwt, requireRole("admin"), asyncHandler(subjectController.createStandalone));
subjectDetailRouter.get("/:id", asyncHandler(subjectController.getOne));
subjectDetailRouter.put("/:id", verifyJwt, requireRole("admin"), asyncHandler(subjectController.updateById));
subjectDetailRouter.put(
  "/:id/assign",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(subjectController.assign)
);
subjectDetailRouter.delete("/:id", verifyJwt, requireRole("admin"), asyncHandler(subjectController.removeById));
subjectDetailRouter.use("/:subjectId/chapters", chapterRouter);
