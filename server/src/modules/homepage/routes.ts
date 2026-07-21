import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole, verifyJwt } from "../../middleware/auth";
import { createUploader } from "../../middleware/upload";
import * as homepageController from "./controller";

export const homepageRouter = Router();

const heroImageUpload = createUploader({
  subdir: "hero",
  allowedMimePrefix: "image/",
  maxSizeMB: 5,
});

homepageRouter.get("/hero-images", asyncHandler(homepageController.listPublic));

homepageRouter.get(
  "/hero-images/all",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(homepageController.listAll)
);
homepageRouter.post(
  "/hero-images",
  verifyJwt,
  requireRole("admin"),
  heroImageUpload.single("image"),
  asyncHandler(homepageController.create)
);
homepageRouter.put(
  "/hero-images/reorder",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(homepageController.reorder)
);
homepageRouter.put(
  "/hero-images/:id",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(homepageController.update)
);
homepageRouter.put(
  "/hero-images/:id/replace",
  verifyJwt,
  requireRole("admin"),
  heroImageUpload.single("image"),
  asyncHandler(homepageController.replace)
);
homepageRouter.delete(
  "/hero-images/:id",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(homepageController.remove)
);
