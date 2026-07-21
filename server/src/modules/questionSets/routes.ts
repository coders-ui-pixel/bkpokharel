import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { optionalAuth, requireRole, verifyJwt } from "../../middleware/auth";
import * as questionSetController from "./controller";

export const questionSetRouter = Router();

questionSetRouter.get("/", optionalAuth, asyncHandler(questionSetController.list));
questionSetRouter.get("/:id/summary", optionalAuth, asyncHandler(questionSetController.getSummary));

questionSetRouter.get(
  "/:id",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(questionSetController.getForAdmin)
);
questionSetRouter.post("/", verifyJwt, requireRole("admin"), asyncHandler(questionSetController.create));
questionSetRouter.put(
  "/:id",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(questionSetController.update)
);
questionSetRouter.delete(
  "/:id",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(questionSetController.remove)
);
questionSetRouter.put(
  "/:id/items",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(questionSetController.setItems)
);
