import { useQuery } from "@tanstack/react-query";
import * as adminStatsApi from "./api";

export function useAdminStatsOverview() {
  return useQuery({
    queryKey: ["admin-stats", "overview"],
    queryFn: adminStatsApi.fetchAdminStatsOverview,
    refetchInterval: 30_000,
  });
}
