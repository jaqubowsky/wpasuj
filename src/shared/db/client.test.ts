import { openTestDatabase } from "@/shared/testing/test-database";
import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it("can be imported where no database is configured, as during the build", async () => {
  vi.stubEnv("DATABASE_PATH", "");

  await expect(import("./client")).resolves.toBeDefined();
});

it("opens the database file in WAL mode with a busy timeout", async () => {
  const db = await openTestDatabase();

  expect(db.$client.pragma("journal_mode", { simple: true })).toBe("wal");
  expect(db.$client.pragma("busy_timeout", { simple: true })).toBeGreaterThan(0);
});
