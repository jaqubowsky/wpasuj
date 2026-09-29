import { stubReducedMotion } from "@/shared/testing/motion";
import { setStopped } from "@/shared/ui/motion-toggle/use-motion";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SwapWord } from "./swap-word";

const shown = (container: HTMLElement) => container.querySelector("[aria-hidden]")!.textContent;

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("SwapWord", () => {
  it("swaps once through the list and stops on grillu", () => {
    stubReducedMotion(false);
    const { container } = render(<SwapWord />);
    const seen = [shown(container)];

    for (let step = 0; step < 7; step++) {
      act(() => vi.advanceTimersByTime(3200));
      seen.push(shown(container));
    }

    expect(seen).toEqual(["grillu?", "planszówkach?", "urodzinach?", "kinie?", "Orliku?", "grillu?", "grillu?", "grillu?"]);
  });

  it("lands on grillu when the motion stops midway", () => {
    stubReducedMotion(false);
    const { container } = render(<SwapWord />);

    act(() => vi.advanceTimersByTime(3200 * 3));
    act(() => setStopped(true));

    expect(shown(container)).toBe("grillu?");
  });
});
