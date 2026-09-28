import { afterEach, expect, it, vi } from "vitest";
import { hasSiteUrl, siteUrl } from "./site-url";

afterEach(() => {
  vi.unstubAllEnvs();
});

it("reads SITE_URL as a URL", () => {
  vi.stubEnv("SITE_URL", "https://wpasuj.pl");

  expect(hasSiteUrl()).toBe(true);
  expect(siteUrl().host).toBe("wpasuj.pl");
});

it.each([
  ["missing", undefined],
  ["empty", ""],
  ["without a scheme", "wpasuj.pl"],
  ["not on the web", "ftp://wpasuj.pl"],
])("refuses a SITE_URL that is %s", (_case, value) => {
  vi.stubEnv("SITE_URL", value);

  expect(hasSiteUrl()).toBe(false);
  expect(() => siteUrl()).toThrow("SITE_URL");
});
