import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole, verifyJwt } from "../../middleware/auth";
import * as studentController from "./controller";

// Mounted at /api/admin/students
export const studentRouter = Router();

studentRouter.use(verifyJwt, requireRole("admin"));

studentRouter.get("/export.csv", asyncHandler(studentController.exportCsv));
studentRouter.get("/", asyncHandler(studentController.list));
studentRouter.get("/:id", asyncHandler(studentController.detail));
studentRouter.put("/:id", asyncHandler(studentController.update));
studentRouter.put("/:id/suspend", asyncHandler(studentController.suspend));
studentRouter.delete("/:id", asyncHandler(studentController.remove));
