import { apiClient } from "../../lib/apiClient";
import type { AnalyticsOverview, DeviceBreakdownRow, WeakChapter } from "./types";

export async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  const { data } = await apiClient.get<AnalyticsOverview>("/admin/analytics/overview");
  return data;
}

export async function fetchWeakChapters(): Promise<WeakChapter[]> {
  const { data } = await apiClient.get<{ weakChapters: WeakChapter[] }>("/admin/analytics/weak-chapters");
  return data.weakChapters;
}

export async function fetchDeviceBreakdown(): Promise<DeviceBreakdownRow[]> {
  const { data } = await apiClient.get<{ devices: DeviceBreakdownRow[] }>("/admin/analytics/devices");
  return data.devices;
}
