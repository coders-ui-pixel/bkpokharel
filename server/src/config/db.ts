import { createPool } from "mysql2";
import type { TypeCastField, TypeCastNext } from "mysql2";
import { CamelCasePlugin, Kysely, MysqlDialect } from "kysely";
import { env } from "./env";
import type { DB } from "./db-types";

// MySQL has no native boolean type — Boolean columns are stored as TINYINT(1).
// mysql2 returns raw 0/1 numbers by default; Prisma used to auto-convert these
// to real booleans, and the entire client/server codebase already assumes real
// booleans end-to-end (course.isPublished, user.isActive, etc.). This typeCast
// keeps that exact same contract so no consuming code has to change.
function typeCast(field: TypeCastField, next: TypeCastNext) {
  if (field.type === "TINY" && field.length === 1) {
    const value = field.string();
    return value === null ? null : value === "1";
  }
  return next();
}

const pool = createPool({
  uri: env.DATABASE_URL,
  connectionLimit: 10,
  decimalNumbers: false, // keep DECIMAL columns as strings — matches the existing
  // frontend contract (Course.price, etc. are typed `string | null` end-to-end).
  typeCast,
});

export const db = new Kysely<DB>({
  dialect: new MysqlDialect({ pool }),
  plugins: [new CamelCasePlugin()],
});

export async function closeDb() {
  await db.destroy();
}
