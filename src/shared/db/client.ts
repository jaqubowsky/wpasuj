import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

function openDatabase() {
  const path = process.env.DATABASE_PATH;
  if (!path) throw new Error("DATABASE_PATH is not set");
  const sqlite = new Database(path);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

let database: ReturnType<typeof openDatabase> | undefined;

export function getDb() {
  database ??= openDatabase();
  return database;
}
