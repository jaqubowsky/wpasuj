import { loggedLines } from "@/shared/testing/logged-lines";
import { afterEach, expect, it, vi } from "vitest";
import { POST } from "./route";

const report = (body: string) => new Request("https://wpasuj.pl/api/failed-saves", { method: "POST", body });

afterEach(() => {
  vi.restoreAllMocks();
});

it("writes one client_save_failed line and answers 204", async () => {
  const lines = loggedLines("error");

  const response = await POST(report(JSON.stringify({ action: "saveAnswer", errorName: "TypeError" })));

  expect(response.status).toBe(204);

  expect(lines().map((line) => JSON.parse(line))).toEqual([
    { level: "error", message: "client_save_failed", action: "saveAnswer", errorName: "TypeError" },
  ]);
});

it.each([
  ["an unknown action", JSON.stringify({ action: "dropTables", errorName: "TypeError" })],
  ["an unknown error name", JSON.stringify({ action: "createPoll", errorName: "Ola's poll failed" })],
  ["an extra key", JSON.stringify({ action: "createPoll", errorName: "Error", title: "Planszówki" })],
  ["a missing key", JSON.stringify({ action: "createPoll" })],
  ["free text", "Planszówki u Oli"],
])("refuses %s with 400 and writes nothing", async (_, body) => {
  const errors = loggedLines("error");
  const infos = loggedLines("log");

  const response = await POST(report(body));

  expect(response.status).toBe(400);
  expect([...errors(), ...infos()]).toEqual([]);
});
