import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole, verifyJwt } from "../../middleware/auth";
import * as chapterController from "./controller";

export const chapterRouter = Router({ mergeParams: true });

chapterRouter.get("/", asyncHandler(chapterController.list));
chapterRouter.post("/", verifyJwt, requireRole("admin"), asyncHandler(chapterController.create));
chapterRouter.put("/:id", verifyJwt, requireRole("admin"), asyncHandler(chapterController.update));
chapterRouter.delete("/:id", verifyJwt, requireRole("admin"), asyncHandler(chapterController.remove));
