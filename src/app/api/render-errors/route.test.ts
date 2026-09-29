import { loggedLines } from "@/shared/testing/logged-lines";
import { afterEach, expect, it, vi } from "vitest";
import { POST } from "./route";

const report = (body: string) => new Request("https://wpasuj.pl/api/render-errors", { method: "POST", body });

afterEach(() => {
  vi.restoreAllMocks();
});

it("writes one client_render_failed line and answers 204", async () => {
  const lines = loggedLines("error");

  const response = await POST(report(JSON.stringify({ errorName: "TypeError", hasDigest: false, route: "/e/[id]" })));

  expect(response.status).toBe(204);

  expect(lines().map((line) => JSON.parse(line))).toEqual([
    { level: "error", message: "client_render_failed", errorName: "TypeError", hasDigest: false, route: "/e/[id]" },
  ]);
});

it.each([
  ["an unknown error name", JSON.stringify({ errorName: "Cannot read Ola's poll", hasDigest: false, route: "/" })],
  ["a digest instead of the flag", JSON.stringify({ errorName: "Error", hasDigest: "1234567", route: "/" })],
  ["a path instead of a route", JSON.stringify({ errorName: "Error", hasDigest: true, route: "/e/abc/organizator/secret" })],
  ["an extra key", JSON.stringify({ errorName: "Error", hasDigest: true, route: "/", message: "Planszówki" })],
  ["a missing key", JSON.stringify({ errorName: "Error", route: "/" })],
  ["free text", "Planszówki u Oli"],
])("refuses %s with 400 and writes nothing", async (_, body) => {
  const errors = loggedLines("error");
  const infos = loggedLines("log");

  const response = await POST(report(body));

  expect(response.status).toBe(400);
  expect([...errors(), ...infos()]).toEqual([]);
});
