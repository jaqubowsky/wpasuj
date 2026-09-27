import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { join } from "node:path";
import { getDb } from "./client";

export function migrateDatabase() {
  migrate(getDb(), { migrationsFolder: join(process.cwd(), "drizzle") });
}
