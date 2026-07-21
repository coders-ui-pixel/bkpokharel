import { AdminRole } from "@prisma/client";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { hashPassword } from "../../services/passwordService";
import { CreateAdminInput } from "./schema";

export async function listAdmins() {
  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, adminRole: true, isActive: true, createdAt: true },
  });
  return admins;
}

export async function createAdmin(input: CreateAdminInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const passwordHash = await hashPassword(input.password);
  const admin = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: "admin",
      adminRole: input.adminRole,
    },
    select: { id: true, name: true, email: true, adminRole: true, isActive: true, createdAt: true },
  });
  return admin;
}

async function countSuperAdmins(excludeUserId?: number): Promise<number> {
  return prisma.user.count({
    where: {
      role: "admin",
      adminRole: "super_admin",
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
  });
}

export async function updateAdminRole(id: number, adminRole: AdminRole) {
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role !== "admin") throw new ApiError(404, "Admin account not found");

  if (target.adminRole === "super_admin" && adminRole !== "super_admin") {
    const remaining = await countSuperAdmins(id);
    if (remaining === 0) {
      throw new ApiError(400, "Cannot demote the last super admin");
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { adminRole },
    select: { id: true, name: true, email: true, adminRole: true, isActive: true, createdAt: true },
  });
  return updated;
}

export async function removeAdmin(id: number, requesterId: number) {
  if (id === requesterId) throw new ApiError(400, "You cannot remove your own admin account");

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role !== "admin") throw new ApiError(404, "Admin account not found");

  if (target.adminRole === "super_admin") {
    const remaining = await countSuperAdmins(id);
    if (remaining === 0) {
      throw new ApiError(400, "Cannot remove the last super admin");
    }
  }

  await prisma.user.delete({ where: { id } });
}
