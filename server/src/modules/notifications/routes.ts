import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole, verifyJwt } from "../../middleware/auth";
import * as notificationController from "./controller";

// Mounted at /api/notifications
export const notificationRouter = Router();

notificationRouter.use(verifyJwt);

notificationRouter.get("/", asyncHandler(notificationController.list));
notificationRouter.put("/read-all", asyncHandler(notificationController.markAllRead));
notificationRouter.put("/:id/read", asyncHandler(notificationController.markRead));
notificationRouter.post(
  "/admin/send",
  requireRole("admin"),
  asyncHandler(notificationController.sendFromAdmin)
);
