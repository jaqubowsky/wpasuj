import { vi } from "vitest";

export function stubReducedMotion(reduced: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query === (reduced ? "(prefers-reduced-motion: reduce)" : "(prefers-reduced-motion: no-preference)"),
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

export function stubIntersection() {
  const observed = { reveal: () => {} };

  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        observed.reveal = () => callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
      }

      observe() {}

      disconnect() {}
    },
  );

  return observed;
}
