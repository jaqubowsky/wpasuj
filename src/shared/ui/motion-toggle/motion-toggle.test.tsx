import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MotionToggle } from "./motion-toggle";
import { useMotion } from "./use-motion";
import { stubReducedMotion } from "@/shared/testing/motion";

function Moving() {
  return <output aria-label="ruch">{useMotion().moving ? "tak" : "nie"}</output>;
}

beforeEach(() => localStorage.clear());

afterEach(() => {
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.motion;
});

describe("MotionToggle", () => {
  it("stops the motion, marks the page still and remembers it", async () => {
    stubReducedMotion(false);

    const { unmount } = render(
      <>
        <MotionToggle />
        <Moving />
      </>,
    );

    expect(screen.getByRole("status", { name: "ruch" })).toHaveTextContent("tak");

    await userEvent.click(screen.getByRole("button", { name: "Zatrzymaj ruch" }));

    expect(screen.getByRole("status", { name: "ruch" })).toHaveTextContent("nie");
    expect(document.documentElement.dataset.motion).toBe("still");
    unmount();

    expect(document.documentElement.dataset.motion).toBeUndefined();

    render(<MotionToggle />);

    expect(screen.getByRole("button", { name: "Włącz ruch" })).toBeInTheDocument();
    expect(document.documentElement.dataset.motion).toBe("still");
  });

  it("starts the motion again", async () => {
    stubReducedMotion(false);
    localStorage.setItem("still-motion", "1");

    render(
      <>
        <MotionToggle />
        <Moving />
      </>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Włącz ruch" }));

    expect(screen.getByRole("status", { name: "ruch" })).toHaveTextContent("tak");
    expect(document.documentElement.dataset.motion).toBeUndefined();
  });

  it("keeps everything still under reduced motion", () => {
    stubReducedMotion(true);
    render(<Moving />);

    expect(screen.getByRole("status", { name: "ruch" })).toHaveTextContent("nie");
  });
});
