import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { optionalAuth, requireRole, verifyJwt } from "../../middleware/auth";
import { createUploader } from "../../middleware/upload";
import * as courseController from "./controller";
import { subjectRouter } from "../subjects/routes";

export const courseRouter = Router();

const coverUpload = createUploader({ subdir: "course-covers", allowedMimePrefix: "image/", maxSizeMB: 5 });
const qrUpload = createUploader({ subdir: "course-qr", allowedMimePrefix: "image/", maxSizeMB: 5 });

courseRouter.get("/", optionalAuth, asyncHandler(courseController.list));
courseRouter.get("/syllabus", asyncHandler(courseController.listSyllabus));
courseRouter.get("/:id", asyncHandler(courseController.getOne));
courseRouter.post("/", verifyJwt, requireRole("admin"), asyncHandler(courseController.create));
courseRouter.put("/:id", verifyJwt, requireRole("admin"), asyncHandler(courseController.update));
courseRouter.delete("/:id", verifyJwt, requireRole("admin"), asyncHandler(courseController.remove));
courseRouter.post(
  "/:id/cover-image",
  verifyJwt,
  requireRole("admin"),
  coverUpload.single("image"),
  asyncHandler(courseController.uploadCoverImage)
);
courseRouter.post(
  "/:id/payment-qr",
  verifyJwt,
  requireRole("admin"),
  qrUpload.single("image"),
  asyncHandler(courseController.uploadPaymentQr)
);

courseRouter.use("/:courseId/subjects", subjectRouter);
