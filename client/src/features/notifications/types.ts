export type NotificationType = "info" | "success" | "warning" | "error";

export interface AppNotification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResult {
  notifications: AppNotification[];
  unreadCount: number;
}

export interface SendNotificationInput {
  title: string;
  body?: string;
  type?: NotificationType;
  link?: string;
  userEmail?: string;
  broadcast?: boolean;
}
