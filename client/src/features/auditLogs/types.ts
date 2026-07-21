export interface AuditLogEntry {
  id: number;
  action: string;
  targetType: string;
  targetId: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  admin: { id: number; name: string; email: string };
}
