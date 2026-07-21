import { useQuery } from "@tanstack/react-query";
import * as auditLogsApi from "./api";

export function useAuditLogs() {
  return useQuery({ queryKey: ["audit-logs"], queryFn: auditLogsApi.fetchAuditLogs });
}
