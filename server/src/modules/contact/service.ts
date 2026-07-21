import { prisma } from "../../config/db";
import { CreateContactMessageInput } from "./schema";

export async function createContactMessage(input: CreateContactMessageInput) {
  return prisma.contactMessage.create({ data: input });
}

export async function listContactMessages() {
  return prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
}
