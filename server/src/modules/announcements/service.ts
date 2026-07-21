import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { sendEmail } from "../../services/emailService";
import { CreateAnnouncementInput, UpdateAnnouncementInput } from "./schema";

export async function listAll() {
  return prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });
}

export async function listActive() {
  const now = new Date();
  return prisma.announcement.findMany({
    where: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
    orderBy: { startsAt: "desc" },
  });
}

export async function create(input: CreateAnnouncementInput, createdBy: number) {
  const announcement = await prisma.announcement.create({
    data: {
      title: input.title,
      body: input.body,
      type: input.type,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      createdBy,
    },
  });

  const students = await prisma.user.findMany({ where: { role: "user" }, select: { id: true, email: true } });

  if (input.sendNotification) {
    await prisma.notification.createMany({
      data: students.map((s) => ({
        userId: s.id,
        title: announcement.title,
        body: announcement.body,
        type: "info" as const,
      })),
    });
  }

  if (input.sendEmail) {
    await Promise.all(
      students.map((s) => sendEmail(s.email, announcement.title, `<p>${announcement.body}</p>`))
    );
  }

  return announcement;
}

export async function update(id: number, input: UpdateAnnouncementInput) {
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Announcement not found");

  return prisma.announcement.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
      ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });
}

export async function remove(id: number) {
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Announcement not found");
  await prisma.announcement.delete({ where: { id } });
}
