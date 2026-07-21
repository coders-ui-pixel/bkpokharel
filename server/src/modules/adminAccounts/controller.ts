import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import * as adminAccountService from "./service";
import * as auditLogService from "../auditLogs/service";
import { createAdminSchema, updateAdminRoleSchema } from "./schema";

export async function list(_req: Request, res: Response) {
  const admins = await adminAccountService.listAdmins();
  res.json({ admins });
}

export async function create(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const input = createAdminSchema.parse(req.body);
  const admin = await adminAccountService.createAdmin(input);
  await auditLogService.log(req.user.id, "admin.create", "user", admin.id, {
    email: admin.email,
    adminRole: admin.adminRole,
  });
  res.status(201).json({ admin });
}

export async function updateRole(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const id = Number(req.params.id);
  const { adminRole } = updateAdminRoleSchema.parse(req.body);
  const admin = await adminAccountService.updateAdminRole(id, adminRole);
  await auditLogService.log(req.user.id, "admin.role_change", "user", id, { newRole: adminRole });
  res.json({ admin });
}

export async function remove(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const id = Number(req.params.id);
  await adminAccountService.removeAdmin(id, req.user.id);
  await auditLogService.log(req.user.id, "admin.delete", "user", id);
  res.status(204).send();
}
