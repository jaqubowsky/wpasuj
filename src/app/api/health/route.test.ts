import { openTestDatabase } from "@/shared/testing/test-database";
import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
});

it("answers 200 once the database opens and SITE_URL is set", async () => {
  await openTestDatabase();
  vi.stubEnv("SITE_URL", "https://wpasuj.pl");
  const { GET } = await import("./route");

  expect(GET().status).toBe(200);
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
