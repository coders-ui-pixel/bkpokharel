import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole, verifyJwt } from "../../middleware/auth";
import { createSecureUploader } from "../../middleware/upload";
import * as noteController from "./controller";

// Mounted at /api/chapters/:chapterId/notes
export const noteRouter = Router({ mergeParams: true });

const noteUpload = createSecureUploader({
  subdir: "notes",
  allowedMimePrefix: "application/pdf",
  maxSizeMB: 25,
});

noteRouter.get("/", verifyJwt, asyncHandler(noteController.list));
noteRouter.get("/:id/file", verifyJwt, asyncHandler(noteController.streamFile));
noteRouter.post(
  "/",
  verifyJwt,
  requireRole("admin"),
  noteUpload.single("file"),
  asyncHandler(noteController.create)
);
noteRouter.put(
  "/:id/replace",
  verifyJwt,
  requireRole("admin"),
  noteUpload.single("file"),
  asyncHandler(noteController.replace)
);
noteRouter.delete("/:id", verifyJwt, requireRole("admin"), asyncHandler(noteController.remove));
noteRouter.put("/:id/reorder", verifyJwt, requireRole("admin"), asyncHandler(noteController.reorder));
