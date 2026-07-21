import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { optionalAuth, requireRole, verifyJwt } from "../../middleware/auth";
import * as liveExamController from "./controller";

export const liveExamRouter = Router();

liveExamRouter.get("/", optionalAuth, asyncHandler(liveExamController.list));
liveExamRouter.get("/:id", optionalAuth, asyncHandler(liveExamController.getOne));
liveExamRouter.post("/", verifyJwt, requireRole("admin"), asyncHandler(liveExamController.create));
liveExamRouter.put("/:id", verifyJwt, requireRole("admin"), asyncHandler(liveExamController.update));
liveExamRouter.put(
  "/:id/cancel",
  verifyJwt,
  requireRole("admin"),
  asyncHandler(liveExamController.cancel)
);
liveExamRouter.delete("/:id", verifyJwt, requireRole("admin"), asyncHandler(liveExamController.remove));
