import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole, verifyJwt } from "../../middleware/auth";
import { createUploader } from "../../middleware/upload";
import * as siteSettingsController from "./controller";

export const siteSettingsRouter = Router();

const brandingUpload = createUploader({
  subdir: "branding",
  allowedMimePrefix: "image/",
  maxSizeMB: 3,
});

siteSettingsRouter.get("/", asyncHandler(siteSettingsController.get));
siteSettingsRouter.put(
  "/",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(siteSettingsController.update)
);
siteSettingsRouter.post(
  "/logo",
  verifyJwt,
  requireRole("admin"),
  brandingUpload.single("image"),
  asyncHandler(siteSettingsController.uploadLogo)
);
siteSettingsRouter.post(
  "/favicon",
  verifyJwt,
  requireRole("admin"),
  brandingUpload.single("image"),
  asyncHandler(siteSettingsController.uploadFavicon)
);
