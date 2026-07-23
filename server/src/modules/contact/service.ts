import { db } from "../../config/db";
import { CreateContactMessageInput } from "./schema";

export async function createContactMessage(input: CreateContactMessageInput) {
  const result = await db.insertInto("contactMessages").values(input).executeTakeFirstOrThrow();
  return db
    .selectFrom("contactMessages")
    .selectAll()
    .where("id", "=", Number(result.insertId))
    .executeTakeFirstOrThrow();
}

export async function listContactMessages() {
  return db.selectFrom("contactMessages").selectAll().orderBy("createdAt", "desc").execute();
}
