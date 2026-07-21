import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole, verifyJwt } from "../../middleware/auth";
import * as announcementController from "./controller";

// Mounted at /api/announcements
export const announcementRouter = Router();

announcementRouter.get("/active", verifyJwt, asyncHandler(announcementController.listActive));
announcementRouter.get(
  "/",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(announcementController.listAll)
);
announcementRouter.post(
  "/",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(announcementController.create)
);
announcementRouter.put(
  "/:id",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(announcementController.update)
);
announcementRouter.delete(
  "/:id",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(announcementController.remove)
);
