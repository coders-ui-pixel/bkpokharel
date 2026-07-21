import { useQuery } from "@tanstack/react-query";
import * as analyticsApi from "./api";

export function useAnalyticsOverview() {
  return useQuery({ queryKey: ["analytics", "overview"], queryFn: analyticsApi.fetchAnalyticsOverview });
}

export function useWeakChapters() {
  return useQuery({ queryKey: ["analytics", "weak-chapters"], queryFn: analyticsApi.fetchWeakChapters });
}

export function useDeviceBreakdown() {
  return useQuery({ queryKey: ["analytics", "devices"], queryFn: analyticsApi.fetchDeviceBreakdown });
}
