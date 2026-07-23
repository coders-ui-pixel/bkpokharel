import type { AdminRole } from "../../config/enums";
import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { hashPassword } from "../../services/passwordService";
import { CreateAdminInput } from "./schema";

const ADMIN_SELECT = ["id", "name", "email", "adminRole", "isActive", "createdAt"] as const;

export async function listAdmins() {
  return db
    .selectFrom("users")
    .select(ADMIN_SELECT)
    .where("role", "=", "admin")
    .orderBy("createdAt", "asc")
    .execute();
}

export async function createAdmin(input: CreateAdminInput) {
  const existing = await db
    .selectFrom("users")
    .select("id")
    .where("email", "=", input.email)
    .executeTakeFirst();
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const passwordHash = await hashPassword(input.password);
  const result = await db
    .insertInto("users")
    .values({
      name: input.name,
      email: input.email,
      passwordHash,
      role: "admin",
      adminRole: input.adminRole,
      updatedAt: new Date(),
    })
    .executeTakeFirstOrThrow();
  return db
    .selectFrom("users")
    .select(ADMIN_SELECT)
    .where("id", "=", Number(result.insertId))
    .executeTakeFirstOrThrow();
}

async function countSuperAdmins(excludeUserId?: number): Promise<number> {
  let query = db
    .selectFrom("users")
    .select((eb) => eb.fn.countAll().as("count"))
    .where("role", "=", "admin")
    .where("adminRole", "=", "super_admin");
  if (excludeUserId) {
    query = query.where("id", "!=", excludeUserId);
  }
  const result = await query.executeTakeFirstOrThrow();
  return Number(result.count);
}

export async function updateAdminRole(id: number, adminRole: AdminRole) {
  const target = await db.selectFrom("users").selectAll().where("id", "=", id).executeTakeFirst();
  if (!target || target.role !== "admin") throw new ApiError(404, "Admin account not found");

  if (target.adminRole === "super_admin" && adminRole !== "super_admin") {
    const remaining = await countSuperAdmins(id);
    if (remaining === 0) {
      throw new ApiError(400, "Cannot demote the last super admin");
    }
  }

  await db
    .updateTable("users")
    .set({ adminRole, updatedAt: new Date() })
    .where("id", "=", id)
    .execute();
  return db.selectFrom("users").select(ADMIN_SELECT).where("id", "=", id).executeTakeFirstOrThrow();
}

export async function removeAdmin(id: number, requesterId: number) {
  if (id === requesterId) throw new ApiError(400, "You cannot remove your own admin account");

  const target = await db.selectFrom("users").selectAll().where("id", "=", id).executeTakeFirst();
  if (!target || target.role !== "admin") throw new ApiError(404, "Admin account not found");

  if (target.adminRole === "super_admin") {
    const remaining = await countSuperAdmins(id);
    if (remaining === 0) {
      throw new ApiError(400, "Cannot remove the last super admin");
    }
  }

  await db.deleteFrom("users").where("id", "=", id).execute();
}
