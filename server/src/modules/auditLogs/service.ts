import { db } from "../../config/db";

export async function log(
  adminId: number,
  action: string,
  targetType: string,
  targetId?: number,
  metadata?: Record<string, unknown>
) {
  await db
    .insertInto("auditLogs")
    .values({
      adminId,
      action,
      targetType,
      targetId: targetId ?? null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    })
    .execute();
}

export async function list(limit = 100) {
  const logs = await db
    .selectFrom("auditLogs")
    .selectAll()
    .orderBy("createdAt", "desc")
    .limit(limit)
    .execute();

  const adminIds = Array.from(new Set(logs.map((l) => l.adminId)));
  const admins = adminIds.length
    ? await db
        .selectFrom("users")
        .select(["id", "name", "email"])
        .where("id", "in", adminIds)
        .execute()
    : [];
  const adminById = new Map(admins.map((a) => [a.id, a]));

  return logs.map((l) => ({
    id: l.id,
    action: l.action,
    targetType: l.targetType,
    targetId: l.targetId,
    metadata: l.metadata ? JSON.parse(l.metadata) : null,
    createdAt: l.createdAt,
    admin: adminById.get(l.adminId) ?? { id: l.adminId, name: "Deleted admin", email: "" },
  }));
}
