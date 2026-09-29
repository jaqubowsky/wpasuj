import { beforeEach, expect, it, vi } from "vitest";
import { reportRenderError } from "./render-error";

const sendBeacon = vi.fn<Navigator["sendBeacon"]>(() => true);
const sentReports = () => sendBeacon.mock.calls.map(([url, body]) => ({ url, body: JSON.parse(String(body)) }));

beforeEach(() => {
  sendBeacon.mockClear();
  navigator.sendBeacon = sendBeacon;
  window.history.replaceState(null, "", "/");
});

it("reports the error name, whether a digest exists and the route to the render-errors route", () => {
  window.history.replaceState(null, "", "/e/abc123");

  reportRenderError(Object.assign(new TypeError("Cannot read properties of undefined"), { digest: "4096" }));

  expect(sentReports()).toEqual([{ url: "/api/render-errors", body: { errorName: "TypeError", hasDigest: true, route: "/e/[id]" } }]);
});

it("names the landing route and an error without a digest", () => {
  reportRenderError(new RangeError("Invalid time zone specified: Etc/Unknown"));

  expect(sentReports()).toEqual([{ url: "/api/render-errors", body: { errorName: "RangeError", hasDigest: false, route: "/" } }]);
});

it("names any other path, error name or thrown value other, so no free text leaves the page", () => {
  window.history.replaceState(null, "", "/e/abc123/organizator/secret-token");

  reportRenderError(Object.assign(new Error("Planszówki u Oli"), { name: "PollError" }));
  reportRenderError("Planszówki u Oli");

  expect(sentReports().map(({ body }) => body)).toEqual([
    { errorName: "other", hasDigest: false, route: "other" },
    { errorName: "other", hasDigest: false, route: "other" },
  ]);
});
