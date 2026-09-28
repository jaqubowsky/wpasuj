import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { onTestFinished, vi } from "vitest";

export async function openTestDatabase() {
  const directory = mkdtempSync(join(tmpdir(), "wpasuj-test-"));

  vi.stubEnv("DATABASE_PATH", join(directory, "test.db"));
  vi.resetModules();
  const { migrateDatabase } = await import("@/shared/db/migrate");

  migrateDatabase();
  const { getDb } = await import("@/shared/db/client");
  const db = getDb();

  onTestFinished(() => {
    db.$client.close();
    rmSync(directory, { recursive: true });
  });

  return db;
}
