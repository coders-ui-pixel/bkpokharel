import { apiClient } from "../../lib/apiClient";
import type { AuditLogEntry } from "./types";

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const { data } = await apiClient.get<{ logs: AuditLogEntry[] }>("/admin/audit-logs");
  return data.logs;
}
