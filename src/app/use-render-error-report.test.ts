import { renderHook } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { useRenderErrorReport } from "./use-render-error-report";

const sendBeacon = vi.fn<Navigator["sendBeacon"]>(() => true);

beforeEach(() => {
  sendBeacon.mockClear();
  navigator.sendBeacon = sendBeacon;
});

it("reports each error the page shows once, however often it renders", () => {
  const first = new TypeError("Cannot read properties of undefined");
  const { rerender } = renderHook(({ error }) => useRenderErrorReport(error), { initialProps: { error: first } });

  rerender({ error: first });
  rerender({ error: new RangeError("Invalid time zone") });

  expect(sendBeacon.mock.calls.map(([, body]) => JSON.parse(String(body)).errorName)).toEqual(["TypeError", "RangeError"]);
});
