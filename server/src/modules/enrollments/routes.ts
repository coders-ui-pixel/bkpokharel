import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole, verifyJwt } from "../../middleware/auth";
import { createUploader } from "../../middleware/upload";
import * as enrollmentController from "./controller";

export const enrollmentRouter = Router();

const proofUpload = createUploader({
  subdir: "payment-proofs",
  allowedMimePrefix: "image/",
  maxSizeMB: 5,
});

enrollmentRouter.use(verifyJwt);

enrollmentRouter.get(
  "/admin",
  requireRole("admin"),
  asyncHandler(enrollmentController.listForAdmin)
);
enrollmentRouter.get(
  "/admin/pending-count",
  requireRole("admin"),
  asyncHandler(enrollmentController.pendingCount)
);
enrollmentRouter.put(
  "/admin/:id/review",
  requireRole("admin"),
  asyncHandler(enrollmentController.review)
);

enrollmentRouter.post("/", proofUpload.single("paymentProof"), asyncHandler(enrollmentController.create));
enrollmentRouter.get("/me", asyncHandler(enrollmentController.listMine));
enrollmentRouter.get("/me/:courseId", asyncHandler(enrollmentController.getMine));
enrollmentRouter.delete("/:courseId", asyncHandler(enrollmentController.remove));
