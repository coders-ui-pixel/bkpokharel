import { apiClient } from "../../lib/apiClient";
import type { AdminStatsOverview } from "./types";

export async function fetchAdminStatsOverview(): Promise<AdminStatsOverview> {
  const { data } = await apiClient.get<AdminStatsOverview>("/admin/stats/overview");
  return data;
}
