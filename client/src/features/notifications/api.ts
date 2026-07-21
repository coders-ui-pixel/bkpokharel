import { apiClient } from "../../lib/apiClient";
import type { NotificationListResult, SendNotificationInput } from "./types";

export async function fetchNotifications(): Promise<NotificationListResult> {
  const { data } = await apiClient.get<NotificationListResult>("/notifications");
  return data;
}

export async function markNotificationRead(id: number): Promise<void> {
  await apiClient.put(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.put("/notifications/read-all");
}

export async function sendNotification(input: SendNotificationInput): Promise<{ sentTo: number }> {
  const { data } = await apiClient.post<{ sentTo: number }>("/notifications/admin/send", input);
  return data;
}
