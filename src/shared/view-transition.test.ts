import { afterEach, describe, expect, it, vi } from "vitest";
import { withViewTransition } from "./view-transition";

function stubReducedMotion(reduced: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: reduced && query === "(prefers-reduced-motion: reduce)" }));
}

function stubViewTransitions() {
  const start = vi.fn((update: () => void) => update());
  Object.defineProperty(document, "startViewTransition", { configurable: true, value: start });
  return start;
}

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(document, "startViewTransition");
});

describe("withViewTransition", () => {
  it("runs the update inside a view transition where the browser has one", () => {
    stubReducedMotion(false);
    const start = stubViewTransitions();
    const update = vi.fn();

    withViewTransition(update);

    expect(start).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledOnce();
  });

  it("runs the update directly under reduced motion", () => {
    stubReducedMotion(true);
    const start = stubViewTransitions();
    const update = vi.fn();

    withViewTransition(update);

    expect(start).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledOnce();
  });

  it("runs the update directly where the browser has no view transitions", () => {
    stubReducedMotion(false);
    const update = vi.fn();

    withViewTransition(update);

    expect(update).toHaveBeenCalledOnce();
  });
});
