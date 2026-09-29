import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTileBurst } from "./tile-burst";
import { stubReducedMotion } from "@/shared/testing/motion";

function Burster() {
  const burst = useTileBurst();

  return (
    <button type="button" onClick={(event) => burst(event.currentTarget, 6)}>
      Ustal
    </button>
  );
}

const tiles = () => document.querySelectorAll("[data-tile-burst]");

beforeEach(() => localStorage.clear());

afterEach(() => {
  vi.unstubAllGlobals();
  tiles().forEach((tile) => tile.remove());
});

describe("useTileBurst", () => {
  it("throws heat tiles out of the element, each gone once it has flown", async () => {
    stubReducedMotion(false);
    render(<Burster />);

    await userEvent.click(screen.getByRole("button", { name: "Ustal" }));

    expect(tiles()).toHaveLength(6);
    expect([...tiles()].every((tile) => tile.getAttribute("aria-hidden") === "true")).toBe(true);

    fireEvent.animationEnd(tiles()[0]);

    expect(tiles()).toHaveLength(5);
  });

  it("throws nothing under reduced motion", async () => {
    stubReducedMotion(true);
    render(<Burster />);

    await userEvent.click(screen.getByRole("button", { name: "Ustal" }));

    expect(tiles()).toHaveLength(0);
  });

  it("throws nothing once the motion is stopped", async () => {
    stubReducedMotion(false);
    localStorage.setItem("still-motion", "1");
    render(<Burster />);

    await userEvent.click(screen.getByRole("button", { name: "Ustal" }));

    expect(tiles()).toHaveLength(0);
  });
});
