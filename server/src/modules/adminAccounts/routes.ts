import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAdminRole, requireRole, verifyJwt } from "../../middleware/auth";
import * as adminAccountController from "./controller";

// Mounted at /api/admin/admins
export const adminAccountRouter = Router();

adminAccountRouter.use(verifyJwt, requireRole("admin"));

adminAccountRouter.get("/", asyncHandler(adminAccountController.list));
adminAccountRouter.post(
  "/",
  requireAdminRole("super_admin"),
  asyncHandler(adminAccountController.create)
);
adminAccountRouter.put(
  "/:id/role",
  requireAdminRole("super_admin"),
  asyncHandler(adminAccountController.updateRole)
);
adminAccountRouter.delete(
  "/:id",
  requireAdminRole("super_admin"),
  asyncHandler(adminAccountController.remove)
);
