import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole, verifyJwt } from "../../middleware/auth";
import * as couponController from "./controller";

export const couponRouter = Router();

couponRouter.use(verifyJwt);

couponRouter.post("/validate", asyncHandler(couponController.validate));

couponRouter.get("/", requireRole("admin"), asyncHandler(couponController.list));
couponRouter.post("/", requireRole("admin"), asyncHandler(couponController.create));
couponRouter.put("/:id", requireRole("admin"), asyncHandler(couponController.update));
couponRouter.delete("/:id", requireRole("admin"), asyncHandler(couponController.remove));
