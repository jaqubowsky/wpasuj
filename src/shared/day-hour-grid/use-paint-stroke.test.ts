import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePaintStroke } from "./use-paint-stroke";

const dates = ["2026-10-16", "2026-10-17", "2026-10-18"];
const hours = [17, 18, 19, 20];

function renderStroke() {
  const onStroke = vi.fn();
  const onTap = vi.fn();
  const { result } = renderHook(() => usePaintStroke({ gridRef: { current: null }, dates, hours, onStroke, onTap }));

  return { result, onStroke, onTap };
}

const mouse = { pointerId: 1, buttons: 1, isPrimary: true, pointerType: "mouse", clientX: 0, clientY: 0 };
const finger = { ...mouse, pointerType: "touch" };
const secondFinger = { ...finger, pointerId: 2, isPrimary: false };

function drag(result: ReturnType<typeof renderStroke>["result"]) {
  act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false, mouse));
  act(() => result.current.move({ date: "2026-10-17", hour: 17 }, mouse));
  act(() => result.current.end(mouse));
}

describe("usePaintStroke", () => {
  it("reports an add rectangle and its first cell for a drag that starts on an empty cell", () => {
    const { result, onStroke } = renderStroke();

    act(() => result.current.start({ date: "2026-10-18", hour: 19 }, false, mouse));
    act(() => result.current.move({ date: "2026-10-17", hour: 20 }, mouse));
    act(() => result.current.move({ date: "2026-10-16", hour: 18 }, mouse));
    act(() => result.current.end(mouse));

    expect(onStroke).toHaveBeenCalledExactlyOnceWith({ dates, hours: [18, 19], mode: "add" }, { date: "2026-10-18", hour: 19 });
  });

  it("reports a remove rectangle for a drag that starts on a filled cell", () => {
    const { result, onStroke } = renderStroke();

    act(() => result.current.start({ date: "2026-10-16", hour: 17 }, true, mouse));
    act(() => result.current.move({ date: "2026-10-17", hour: 17 }, mouse));
    act(() => result.current.end(mouse));

    expect(onStroke).toHaveBeenCalledExactlyOnceWith(
      { dates: ["2026-10-16", "2026-10-17"], hours: [17], mode: "remove" },
      { date: "2026-10-16", hour: 17 },
    );
  });

  it("leaves a press that never leaves its cell to the tap", () => {
    const { result, onStroke } = renderStroke();

    act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false, mouse));
    act(() => result.current.move({ date: "2026-10-16", hour: 17 }, mouse));
    act(() => result.current.end(mouse));

    expect(onStroke).not.toHaveBeenCalled();
  });

  it("previews the rectangle in progress and clears it when the stroke ends", () => {
    const { result } = renderStroke();

    act(() => result.current.start({ date: "2026-10-16", hour: 17 }, true, mouse));
    act(() => result.current.move({ date: "2026-10-17", hour: 18 }, mouse));

    expect(result.current.preview({ date: "2026-10-17", hour: 17 })).toBe("removing");
    expect(result.current.preview({ date: "2026-10-18", hour: 17 })).toBeUndefined();
    expect(result.current.preview({ date: "2026-10-16", hour: 19 })).toBeUndefined();

    act(() => result.current.end(mouse));

    expect(result.current.preview({ date: "2026-10-17", hour: 17 })).toBeUndefined();
  });

  it("toggles one cell on a tap", () => {
    const { result, onTap } = renderStroke();

    act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false, mouse));
    act(() => result.current.end(mouse));
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

  it("lets a new press replace a stroke whose pointer went away unseen", () => {
    const { result, onStroke } = renderStroke();

    act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false, mouse));
    act(() => result.current.start({ date: "2026-10-18", hour: 20 }, true, mouse));
    act(() => result.current.move({ date: "2026-10-18", hour: 19 }, mouse));
    act(() => result.current.end(mouse));

    expect(onStroke).toHaveBeenCalledExactlyOnceWith(
      { dates: ["2026-10-18"], hours: [19, 20], mode: "remove" },
      { date: "2026-10-18", hour: 20 },
    );
  });

  it("drops a stroke the browser cancels", () => {
    const { result, onStroke } = renderStroke();

    act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false, mouse));
    act(() => result.current.move({ date: "2026-10-17", hour: 18 }, mouse));
    act(() => result.current.cancel(mouse));
    act(() => result.current.end(mouse));

    expect(onStroke).not.toHaveBeenCalled();
    expect(result.current.preview({ date: "2026-10-17", hour: 18 })).toBeUndefined();
  });

  it("drops a stroke once the pointer moves with no button pressed", () => {
    const { result, onStroke } = renderStroke();

    act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false, mouse));
    act(() => result.current.move({ date: "2026-10-17", hour: 18 }, mouse));
    act(() => result.current.move({ date: "2026-10-18", hour: 19 }, { ...mouse, buttons: 0 }));
    act(() => result.current.end(mouse));

    expect(onStroke).not.toHaveBeenCalled();
    expect(result.current.preview({ date: "2026-10-17", hour: 18 })).toBeUndefined();
  });

  describe("on touch", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("keeps the rectangle of the first finger when a second one touches the grid", () => {
      const { result, onStroke } = renderStroke();

      act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false, finger));
      act(() => vi.advanceTimersByTime(300));
      act(() => result.current.move({ date: "2026-10-17", hour: 18 }, finger));
      act(() => result.current.start({ date: "2026-10-18", hour: 20 }, true, secondFinger));
      act(() => vi.advanceTimersByTime(300));
      act(() => result.current.move({ date: "2026-10-18", hour: 20 }, secondFinger));
      act(() => result.current.end(secondFinger));
      act(() => result.current.end(finger));

      expect(onStroke).toHaveBeenCalledExactlyOnceWith(
        { dates: ["2026-10-16", "2026-10-17"], hours: [17, 18], mode: "add" },
        { date: "2026-10-16", hour: 17 },
      );
    });

    it("drops the press once the finger moves more than 8px before the hold", () => {
      const { result, onStroke } = renderStroke();

      act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false, finger));
      act(() => result.current.move({ date: "2026-10-16", hour: 17 }, { ...finger, clientY: 9 }));
      act(() => vi.advanceTimersByTime(300));
      act(() => result.current.move({ date: "2026-10-16", hour: 18 }, { ...finger, clientY: 9 }));
      act(() => result.current.end(finger));

      expect(onStroke).not.toHaveBeenCalled();
      expect(result.current.preview({ date: "2026-10-16", hour: 17 })).toBeUndefined();
    });

    it("paints the rectangle of a drag that follows a 300ms hold", () => {
      const { result, onStroke } = renderStroke();

      act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false, finger));
      act(() => vi.advanceTimersByTime(299));

      expect(result.current.preview({ date: "2026-10-16", hour: 17 })).toBeUndefined();

      act(() => vi.advanceTimersByTime(1));

      expect(result.current.preview({ date: "2026-10-16", hour: 17 })).toBe("adding");

      act(() => result.current.move({ date: "2026-10-17", hour: 19 }, { ...finger, clientX: 70, clientY: 110 }));
      act(() => result.current.end(finger));

      expect(onStroke).toHaveBeenCalledExactlyOnceWith(
        { dates: ["2026-10-16", "2026-10-17"], hours: [17, 18, 19], mode: "add" },
        { date: "2026-10-16", hour: 17 },
      );
    });

    it("toggles the held cell once when a hold ends where it began", () => {
      const { result, onStroke, onTap } = renderStroke();

      act(() => result.current.start({ date: "2026-10-16", hour: 17 }, true, finger));
      act(() => vi.advanceTimersByTime(300));
      act(() => result.current.end(finger));
      act(() => result.current.tap({ date: "2026-10-16", hour: 17 }, "pointer"));

      expect(onStroke).toHaveBeenCalledExactlyOnceWith(
        { dates: ["2026-10-16"], hours: [17], mode: "remove" },
        { date: "2026-10-16", hour: 17 },
      );

      expect(onTap).not.toHaveBeenCalled();
    });

    it("leaves a short press to the tap", () => {
      const { result, onStroke, onTap } = renderStroke();

      act(() => result.current.start({ date: "2026-10-16", hour: 17 }, false, finger));
      act(() => vi.advanceTimersByTime(100));
      act(() => result.current.end(finger));
      act(() => vi.advanceTimersByTime(300));
      act(() => result.current.tap({ date: "2026-10-16", hour: 17 }, "pointer"));

      expect(onStroke).not.toHaveBeenCalled();
      expect(onTap).toHaveBeenCalledExactlyOnceWith({ date: "2026-10-16", hour: 17 });
    });
  });
});
