import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it("can be imported where no database is configured, as during the build", async () => {
  vi.stubEnv("DATABASE_PATH", "");

  await expect(import("./client")).resolves.toBeDefined();
});
