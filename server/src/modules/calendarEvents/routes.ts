import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole, verifyJwt } from "../../middleware/auth";
import * as calendarEventController from "./controller";

// Mounted at /api/calendar-events
export const calendarEventRouter = Router();

calendarEventRouter.use(verifyJwt);

calendarEventRouter.get("/", asyncHandler(calendarEventController.listForRange));
calendarEventRouter.get(
  "/admin",
  requireRole("admin"),
  asyncHandler(calendarEventController.listAll)
);
calendarEventRouter.post("/", requireRole("admin"), asyncHandler(calendarEventController.create));
calendarEventRouter.put("/:id", requireRole("admin"), asyncHandler(calendarEventController.update));
calendarEventRouter.delete(
  "/:id",
  requireRole("admin"),
  asyncHandler(calendarEventController.remove)
);
