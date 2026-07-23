import { db } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { sendEmail } from "../../services/emailService";
import { CreateAnnouncementInput, UpdateAnnouncementInput } from "./schema";

export async function listAll() {
  return db.selectFrom("announcements").selectAll().orderBy("createdAt", "desc").execute();
}

export async function listActive() {
  const now = new Date();
  return db
    .selectFrom("announcements")
    .selectAll()
    .where("isActive", "=", true)
    .where("startsAt", "<=", now)
    .where("endsAt", ">=", now)
    .orderBy("startsAt", "desc")
    .execute();
}

export async function create(input: CreateAnnouncementInput, createdBy: number) {
  const result = await db
    .insertInto("announcements")
    .values({
      title: input.title,
      body: input.body,
      type: input.type,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      createdBy,
      updatedAt: new Date(),
    })
    .executeTakeFirstOrThrow();
  const announcement = await db
    .selectFrom("announcements")
    .selectAll()
    .where("id", "=", Number(result.insertId))
    .executeTakeFirstOrThrow();

  const students = await db.selectFrom("users").select(["id", "email"]).where("role", "=", "user").execute();

  if (input.sendNotification && students.length > 0) {
    await db
      .insertInto("notifications")
      .values(
        students.map((s) => ({
          userId: s.id,
          title: announcement.title,
          body: announcement.body,
          type: "info" as const,
        }))
      )
      .execute();
  }

  if (input.sendEmail) {
    await Promise.all(
      students.map((s) => sendEmail(s.email, announcement.title, `<p>${announcement.body}</p>`))
    );
  }

  return announcement;
}

export async function update(id: number, input: UpdateAnnouncementInput) {
  const existing = await db.selectFrom("announcements").selectAll().where("id", "=", id).executeTakeFirst();
  if (!existing) throw new ApiError(404, "Announcement not found");

  await db
    .updateTable("announcements")
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
      ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      updatedAt: new Date(),
    })
    .where("id", "=", id)
    .execute();
  return db.selectFrom("announcements").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
}

export async function remove(id: number) {
  const existing = await db.selectFrom("announcements").selectAll().where("id", "=", id).executeTakeFirst();
  if (!existing) throw new ApiError(404, "Announcement not found");
  await db.deleteFrom("announcements").where("id", "=", id).execute();
}
