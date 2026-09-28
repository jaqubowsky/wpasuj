import { openTestDatabase } from "@/shared/testing/test-database";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

afterEach(() => {
  vi.unstubAllEnvs();
});

it("answers 200 once the database opens", async () => {
  await openTestDatabase();
  const { GET } = await import("./route");

  expect(GET().status).toBe(200);
});

it("fails while the database cannot open", async () => {
  vi.stubEnv("DATABASE_PATH", "/nonexistent/directory/wpasuj.db");
  vi.resetModules();
  const { GET } = await import("./route");

  expect(() => GET()).toThrow();
});
