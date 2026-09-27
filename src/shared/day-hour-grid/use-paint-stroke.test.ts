import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePaintStroke } from "./use-paint-stroke";

const dates = ["2026-10-16", "2026-10-17", "2026-10-18"];
const hours = [17, 18, 19, 20];

function renderStroke() {
  const onStroke = vi.fn();
  const onTap = vi.fn();
  const { result } = renderHook(() => usePaintStroke({ dates, hours, onStroke, onTap }));
  return { result, onStroke, onTap };
}

function drag(result: ReturnType<typeof renderStroke>["result"]) {
  act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false));
  act(() => result.current.move({ date: "2026-10-17", hour: 17 }));
  act(() => result.current.end());
}

describe("usePaintStroke", () => {
  it("reports an add rectangle for a drag that starts on an empty cell", () => {
    const { result, onStroke } = renderStroke();

    act(() => result.current.start({ date: "2026-10-18", hour: 19 }, false));
    act(() => result.current.move({ date: "2026-10-17", hour: 20 }));
    act(() => result.current.move({ date: "2026-10-16", hour: 18 }));
    act(() => result.current.end());

    expect(onStroke).toHaveBeenCalledExactlyOnceWith({ dates, hours: [18, 19], mode: "add" });
  });

  it("reports a remove rectangle for a drag that starts on a filled cell", () => {
    const { result, onStroke } = renderStroke();

    act(() => result.current.start({ date: "2026-10-16", hour: 17 }, true));
    act(() => result.current.move({ date: "2026-10-17", hour: 17 }));
    act(() => result.current.end());

    expect(onStroke).toHaveBeenCalledExactlyOnceWith({ dates: ["2026-10-16", "2026-10-17"], hours: [17], mode: "remove" });
  });

  it("leaves a press that never leaves its cell to the tap", () => {
    const { result, onStroke } = renderStroke();

    act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false));
    act(() => result.current.move({ date: "2026-10-16", hour: 17 }));
    act(() => result.current.end());

    expect(onStroke).not.toHaveBeenCalled();
  });

  it("previews the rectangle in progress and clears it when the stroke ends", () => {
    const { result } = renderStroke();

    act(() => result.current.start({ date: "2026-10-16", hour: 17 }, true));
    act(() => result.current.move({ date: "2026-10-17", hour: 18 }));

    expect(result.current.preview({ date: "2026-10-17", hour: 17 })).toBe("removing");
    expect(result.current.preview({ date: "2026-10-18", hour: 17 })).toBeUndefined();
    expect(result.current.preview({ date: "2026-10-16", hour: 19 })).toBeUndefined();

    act(() => result.current.end());

    expect(result.current.preview({ date: "2026-10-17", hour: 17 })).toBeUndefined();
  });

  it("toggles one cell on a tap", () => {
    const { result, onTap } = renderStroke();

    act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false));
    act(() => result.current.end());
    act(() => result.current.tap({ date: "2026-10-16", hour: 17 }, "pointer"));

    expect(onTap).toHaveBeenCalledExactlyOnceWith({ date: "2026-10-16", hour: 17 });
  });

  it("does not take the click that ends a drag for a tap", () => {
    const { result, onTap } = renderStroke();

    drag(result);
    act(() => result.current.tap({ date: "2026-10-17", hour: 17 }, "pointer"));

    expect(onTap).not.toHaveBeenCalled();
  });

  it("toggles from the keyboard right after a drag", () => {
    const { result, onTap } = renderStroke();

    drag(result);
    act(() => result.current.tap({ date: "2026-10-18", hour: 19 }, "keyboard"));

    expect(onTap).toHaveBeenCalledExactlyOnceWith({ date: "2026-10-18", hour: 19 });
  });
});
