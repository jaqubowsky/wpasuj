import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePointerFollow } from "./use-pointer-follow";
import { stubReducedMotion } from "@/shared/testing/motion";

function Field() {
  return <div ref={usePointerFollow<HTMLDivElement>()} data-testid="field" />;
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("innerWidth", 1000);
  vi.stubGlobal("innerHeight", 800);
});

afterEach(() => vi.unstubAllGlobals());

describe("usePointerFollow", () => {
  it("tells the field where the pointer is, from -0.5 to 0.5 across the window", () => {
    stubReducedMotion(false);
    render(<Field />);

    fireEvent.pointerMove(window, { clientX: 1000, clientY: 200 });

    expect(screen.getByTestId("field").style.getPropertyValue("--pointer-x")).toBe("0.500");
    expect(screen.getByTestId("field").style.getPropertyValue("--pointer-y")).toBe("-0.250");
  });

  it("ignores the pointer under reduced motion", () => {
    stubReducedMotion(true);
    render(<Field />);

    fireEvent.pointerMove(window, { clientX: 1000, clientY: 200 });

    expect(screen.getByTestId("field").style.getPropertyValue("--pointer-x")).toBe("");
  });
});
