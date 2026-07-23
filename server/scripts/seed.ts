import "dotenv/config";
import bcrypt from "bcryptjs";
import { db, closeDb } from "../src/config/db";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";

  const existing = await db.selectFrom("users").select("id").where("email", "=", email).executeTakeFirst();
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db
    .insertInto("users")
    .values({
      name: "Admin",
      email,
      passwordHash,
      role: "admin",
      adminRole: "super_admin",
    })
    .execute();

  console.log(`Seeded admin user: ${email} / ${password}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
