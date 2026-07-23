import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import type { NotificationType } from "../../config/enums";
import { SendNotificationInput } from "./schema";

export async function notify(
  userId: number,
  data: { title: string; body?: string; type?: NotificationType; link?: string }
) {
  const result = await db
    .insertInto("notifications")
    .values({
      userId,
      title: data.title,
      body: data.body ?? null,
      type: data.type ?? "info",
      link: data.link ?? null,
    })
    .executeTakeFirstOrThrow();
  return db
    .selectFrom("notifications")
    .selectAll()
    .where("id", "=", Number(result.insertId))
    .executeTakeFirstOrThrow();
}

export async function listForUser(userId: number) {
  const [notifications, unreadCount] = await Promise.all([
    db
      .selectFrom("notifications")
      .selectAll()
      .where("userId", "=", userId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .execute(),
    db
      .selectFrom("notifications")
      .select((eb) => eb.fn.countAll().as("count"))
      .where("userId", "=", userId)
      .where("isRead", "=", false)
      .executeTakeFirstOrThrow(),
  ]);
  return { notifications, unreadCount: Number(unreadCount.count) };
}

export async function markRead(userId: number, id: number) {
  const notification = await db
    .selectFrom("notifications")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
  if (!notification) throw new ApiError(404, "Notification not found");
  if (notification.userId !== userId) throw new ApiError(403, "Not your notification");
  await db.updateTable("notifications").set({ isRead: true }).where("id", "=", id).execute();
  return db.selectFrom("notifications").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}

export async function markAllRead(userId: number) {
  await db
    .updateTable("notifications")
    .set({ isRead: true })
    .where("userId", "=", userId)
    .where("isRead", "=", false)
    .execute();
}

export async function sendFromAdmin(input: SendNotificationInput) {
  const payload = {
    title: input.title,
    body: input.body ?? null,
    type: input.type,
    link: input.link ?? null,
  };

  if (input.broadcast) {
    const users = await db.selectFrom("users").select("id").where("role", "=", "user").execute();
    if (users.length > 0) {
      await db
        .insertInto("notifications")
        .values(users.map((u) => ({ userId: u.id, ...payload })))
        .execute();
    }
    return { sentTo: users.length };
  }

  if (!input.userEmail) throw new ApiError(400, "userEmail is required when not broadcasting");
  const user = await db
    .selectFrom("users")
    .select("id")
    .where("email", "=", input.userEmail)
    .executeTakeFirst();
  if (!user) throw new ApiError(404, "No user found with that email");
  await db.insertInto("notifications").values({ userId: user.id, ...payload }).execute();
  return { sentTo: 1 };
}
