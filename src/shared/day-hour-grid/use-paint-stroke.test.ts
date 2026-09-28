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

const finger = { pointerId: 1, buttons: 1, isPrimary: true };
const secondFinger = { pointerId: 2, buttons: 1, isPrimary: false };

function drag(result: ReturnType<typeof renderStroke>["result"]) {
  act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false, finger));
  act(() => result.current.move({ date: "2026-10-17", hour: 17 }, finger));
  act(() => result.current.end(finger));
}

describe("usePaintStroke", () => {
  it("reports an add rectangle for a drag that starts on an empty cell", () => {
    const { result, onStroke } = renderStroke();

    act(() => result.current.start({ date: "2026-10-18", hour: 19 }, false, finger));
    act(() => result.current.move({ date: "2026-10-17", hour: 20 }, finger));
    act(() => result.current.move({ date: "2026-10-16", hour: 18 }, finger));
    act(() => result.current.end(finger));

    expect(onStroke).toHaveBeenCalledExactlyOnceWith({ dates, hours: [18, 19], mode: "add" });
  });

  it("reports a remove rectangle for a drag that starts on a filled cell", () => {
    const { result, onStroke } = renderStroke();

    act(() => result.current.start({ date: "2026-10-16", hour: 17 }, true, finger));
    act(() => result.current.move({ date: "2026-10-17", hour: 17 }, finger));
    act(() => result.current.end(finger));

    expect(onStroke).toHaveBeenCalledExactlyOnceWith({ dates: ["2026-10-16", "2026-10-17"], hours: [17], mode: "remove" });
  });

  it("leaves a press that never leaves its cell to the tap", () => {
    const { result, onStroke } = renderStroke();

    act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false, finger));
    act(() => result.current.move({ date: "2026-10-16", hour: 17 }, finger));
    act(() => result.current.end(finger));

    expect(onStroke).not.toHaveBeenCalled();
  });

  it("previews the rectangle in progress and clears it when the stroke ends", () => {
    const { result } = renderStroke();

    act(() => result.current.start({ date: "2026-10-16", hour: 17 }, true, finger));
    act(() => result.current.move({ date: "2026-10-17", hour: 18 }, finger));

    expect(result.current.preview({ date: "2026-10-17", hour: 17 })).toBe("removing");
    expect(result.current.preview({ date: "2026-10-18", hour: 17 })).toBeUndefined();
    expect(result.current.preview({ date: "2026-10-16", hour: 19 })).toBeUndefined();

    act(() => result.current.end(finger));

    expect(result.current.preview({ date: "2026-10-17", hour: 17 })).toBeUndefined();
  });

  it("toggles one cell on a tap", () => {
    const { result, onTap } = renderStroke();

    act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false, finger));
    act(() => result.current.end(finger));
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

  it("keeps the rectangle of the first finger when a second one touches the grid", () => {
    const { result, onStroke } = renderStroke();

    act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false, finger));
    act(() => result.current.move({ date: "2026-10-17", hour: 18 }, finger));
    act(() => result.current.start({ date: "2026-10-18", hour: 20 }, true, secondFinger));
    act(() => result.current.move({ date: "2026-10-18", hour: 20 }, secondFinger));
    act(() => result.current.end(secondFinger));
    act(() => result.current.end(finger));

    expect(onStroke).toHaveBeenCalledExactlyOnceWith({ dates: ["2026-10-16", "2026-10-17"], hours: [17, 18], mode: "add" });
  });

  it("lets a new press replace a stroke whose pointer went away unseen", () => {
    const { result, onStroke } = renderStroke();

    act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false, finger));
    act(() => result.current.start({ date: "2026-10-18", hour: 20 }, true, finger));
    act(() => result.current.move({ date: "2026-10-18", hour: 19 }, finger));
    act(() => result.current.end(finger));

    expect(onStroke).toHaveBeenCalledExactlyOnceWith({ dates: ["2026-10-18"], hours: [19, 20], mode: "remove" });
  });

  it("drops a stroke the browser cancels", () => {
    const { result, onStroke } = renderStroke();

    act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false, finger));
    act(() => result.current.move({ date: "2026-10-17", hour: 18 }, finger));
    act(() => result.current.cancel(finger));
    act(() => result.current.end(finger));

    expect(onStroke).not.toHaveBeenCalled();
    expect(result.current.preview({ date: "2026-10-17", hour: 18 })).toBeUndefined();
  });

  it("drops a stroke once the pointer moves with no button pressed", () => {
    const { result, onStroke } = renderStroke();

    act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false, finger));
    act(() => result.current.move({ date: "2026-10-17", hour: 18 }, finger));
    act(() => result.current.move({ date: "2026-10-18", hour: 19 }, { ...finger, buttons: 0 }));
    act(() => result.current.end(finger));

    expect(onStroke).not.toHaveBeenCalled();
    expect(result.current.preview({ date: "2026-10-17", hour: 18 })).toBeUndefined();
  });
});
