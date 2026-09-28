import { afterEach, expect, it, vi } from "vitest";
import { onRequestError } from "./instrumentation";

const request = { path: "/e/abc123", method: "GET", headers: {} };
const context = {
  routerKind: "App Router",
  routePath: "/e/[id]",
  routeType: "render",
  renderSource: "react-server-components",
  revalidateReason: undefined,
  renderType: "dynamic",
} as const;

afterEach(() => {
  vi.restoreAllMocks();
});

function loggedLines() {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  return () => log.mock.calls.map((args) => args.join(" "));
}

it("writes a server error as one JSON line with its path and digest", async () => {
  const lines = loggedLines();

  await onRequestError(Object.assign(new TypeError("Invalid URL"), { digest: "1007449423" }), request, context);

  expect(lines()).toHaveLength(1);
  expect(lines()[0]).not.toContain("\n");
  expect(JSON.parse(lines()[0])).toEqual({
    level: "error",
    message: "Invalid URL",
    path: "/e/abc123",
    digest: "1007449423",
    routeType: "render",
  });
});

it("writes a thrown value that is not an Error as its text", async () => {
  const lines = loggedLines();

  await onRequestError("database locked", request, { ...context, routeType: "action" });

  expect(JSON.parse(lines()[0])).toEqual({ level: "error", message: "database locked", path: "/e/abc123", routeType: "action" });
});

it("logs an error on the organiser route without its token or query", async () => {
  const lines = loggedLines();

  await onRequestError(new Error("boom"), { ...request, path: "/e/abc123/organizator/s3cr3tT0k3n-_x?from=share" }, { ...context, routeType: "route", routePath: "/e/[id]/organizator/[token]" });

  expect(lines()[0]).not.toContain("s3cr3tT0k3n");
  expect(JSON.parse(lines()[0]).path).toBe("/e/abc123/organizator/[token]");
});

it("logs the path without its query", async () => {
  const lines = loggedLines();

  await onRequestError(new Error("boom"), { ...request, path: "/e/abc123?tab=wszyscy" }, context);

  expect(JSON.parse(lines()[0]).path).toBe("/e/abc123");
});
