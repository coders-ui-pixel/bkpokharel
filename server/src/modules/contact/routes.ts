import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole, verifyJwt } from "../../middleware/auth";
import * as contactController from "./controller";

export const contactRouter = Router();

contactRouter.post("/", asyncHandler(contactController.create));
contactRouter.get("/", verifyJwt, requireRole("admin"), asyncHandler(contactController.list));
