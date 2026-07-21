import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole, verifyJwt } from "../../middleware/auth";
import { env } from "../../config/env";
import * as importantQuestionController from "./controller";

// Mounted at /api/chapters/:chapterId/important-questions
export const importantQuestionRouter = Router({ mergeParams: true });

const destDir = path.join(env.UPLOAD_DIR, "important-questions");
fs.mkdirSync(destDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "application/pdf"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Only PNG, JPEG, or PDF files are allowed"));
      return;
    }
    cb(null, true);
  },
});

importantQuestionRouter.get("/", verifyJwt, asyncHandler(importantQuestionController.list));
importantQuestionRouter.post(
  "/",
  verifyJwt,
  requireRole("admin"),
  upload.single("file"),
  asyncHandler(importantQuestionController.create)
);
importantQuestionRouter.delete(
  "/:id",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(importantQuestionController.remove)
);
importantQuestionRouter.put(
  "/:id/reorder",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(importantQuestionController.reorder)
);
