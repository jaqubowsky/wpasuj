import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BrandMark } from "./brand-mark";
import { stubReducedMotion } from "@/shared/testing/motion";

const bursts = () => document.querySelectorAll("[data-tile-burst]");
const heats = () => [...document.querySelectorAll("[data-brand-tile]")].map((tile) => tile.getAttribute("data-brand-tile"));

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("scrollTo", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  bursts().forEach((tile) => tile.remove());
});

describe("BrandMark", () => {
  it("scrolls to the top, reshuffles its tiles and bursts", async () => {
    stubReducedMotion(false);
    render(<BrandMark />);
    const before = heats();

    vi.spyOn(Math, "random").mockReturnValue(0);
    await userEvent.click(screen.getByRole("button", { name: "Wpasuj, na górę strony" }));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    expect(heats()).not.toEqual(before);
    expect(heats().toSorted()).toEqual(before.toSorted());
    expect(bursts().length).toBeGreaterThan(0);
  });

  it("jumps to the top without a burst once the motion is stopped", async () => {
    stubReducedMotion(false);
    localStorage.setItem("still-motion", "1");
    render(<BrandMark />);

    await userEvent.click(screen.getByRole("button", { name: "Wpasuj, na górę strony" }));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
    expect(bursts()).toHaveLength(0);
  });

  it("bursts nothing under reduced motion", async () => {
    stubReducedMotion(true);
    render(<BrandMark />);

    await userEvent.click(screen.getByRole("button", { name: "Wpasuj, na górę strony" }));

    expect(bursts()).toHaveLength(0);
  });
});
