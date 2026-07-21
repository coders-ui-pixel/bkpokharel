import { prisma } from "../../config/db";

export async function log(
  adminId: number,
  action: string,
  targetType: string,
  targetId?: number,
  metadata?: Record<string, unknown>
) {
  await prisma.auditLog.create({
    data: {
      adminId,
      action,
      targetType,
      targetId,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    },
  });
}

export async function list(limit = 100) {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const adminIds = Array.from(new Set(logs.map((l) => l.adminId)));
  const admins = await prisma.user.findMany({
    where: { id: { in: adminIds } },
    select: { id: true, name: true, email: true },
  });
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
