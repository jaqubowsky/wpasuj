import { openTestDatabase } from "@/shared/testing/test-database";
import { chmodSync } from "node:fs";
import { afterEach, expect, it, onTestFinished, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
});

it("answers 200 once the database opens and SITE_URL is set", async () => {
  await openTestDatabase();
  vi.stubEnv("SITE_URL", "https://wpasuj.pl");
  const { GET } = await import("./route");

  expect(GET().status).toBe(200);
});

it("leaves the database as it found it", async () => {
  const db = await openTestDatabase();

  vi.stubEnv("SITE_URL", "https://wpasuj.pl");
  const before = db.$client.pragma("user_version", { simple: true });
  const { GET } = await import("./route");

  GET();

  expect(db.$client.pragma("user_version", { simple: true })).toBe(before);
});

it("answers 503 while the database file is read-only, so the deploy is refused", async () => {
  const db = await openTestDatabase();

  vi.stubEnv("SITE_URL", "https://wpasuj.pl");
  db.$client.close();
  chmodSync(db.$client.name, 0o444);
  vi.resetModules();
  const { GET } = await import("./route");
  const { getDb } = await import("@/shared/db/client");

  onTestFinished(() => {
    getDb().$client.close();
  });

  const response = GET();

  expect(response.status).toBe(503);
  expect(await response.text()).toContain("SQLITE_READONLY");
});

it("fails while the database cannot open", async () => {
  vi.stubEnv("DATABASE_PATH", "/nonexistent/directory/wpasuj.db");
  vi.resetModules();
  const { GET } = await import("./route");

  expect(() => GET()).toThrow();
});

it("answers 503 while SITE_URL is missing, so the deploy is refused", async () => {
  await openTestDatabase();
  vi.stubEnv("SITE_URL", undefined);
  const { GET } = await import("./route");

  expect(GET().status).toBe(503);
});
