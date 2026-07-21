import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { NotificationType } from "@prisma/client";
import { SendNotificationInput } from "./schema";

export async function notify(
  userId: number,
  data: { title: string; body?: string; type?: NotificationType; link?: string }
) {
  return prisma.notification.create({
    data: {
      userId,
      title: data.title,
      body: data.body,
      type: data.type ?? "info",
      link: data.link,
    },
  });
}

export async function listForUser(userId: number) {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  return { notifications, unreadCount };
}

export async function markRead(userId: number, id: number) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw new ApiError(404, "Notification not found");
  if (notification.userId !== userId) throw new ApiError(403, "Not your notification");
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
}

export async function markAllRead(userId: number) {
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}

export async function sendFromAdmin(input: SendNotificationInput) {
  const payload = { title: input.title, body: input.body, type: input.type, link: input.link };

  if (input.broadcast) {
    const users = await prisma.user.findMany({ where: { role: "user" }, select: { id: true } });
    await prisma.notification.createMany({
      data: users.map((u) => ({ userId: u.id, ...payload })),
    });
    return { sentTo: users.length };
  }

  const user = await prisma.user.findUnique({ where: { email: input.userEmail } });
  if (!user) throw new ApiError(404, "No user found with that email");
  await prisma.notification.create({ data: { userId: user.id, ...payload } });
  return { sentTo: 1 };
}
