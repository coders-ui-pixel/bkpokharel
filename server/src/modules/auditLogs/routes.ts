import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireRole, verifyJwt } from "../../middleware/auth";
import * as auditLogController from "./controller";

// Mounted at /api/admin/audit-logs
export const auditLogRouter = Router();

auditLogRouter.use(verifyJwt, requireRole("admin"));
auditLogRouter.get("/", asyncHandler(auditLogController.list));
