import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TileWord } from "./tile-word";
import { stubReducedMotion, stubIntersection } from "@/shared/testing/motion";

let intersection: ReturnType<typeof stubIntersection>;

beforeEach(() => {
  localStorage.clear();
  Element.prototype.animate = vi.fn();

  intersection = stubIntersection();
});

afterEach(() => vi.unstubAllGlobals());

describe("TileWord", () => {
  it("spells the name in six letters of tiles and lights them once in view", () => {
    stubReducedMotion(false);
    render(<TileWord />);
    const word = screen.getByRole("img", { name: "Wpasuj" });

    expect(word.children).toHaveLength(6);
    expect(word).not.toHaveAttribute("data-lit");

    act(() => intersection.reveal());

    expect(word).toHaveAttribute("data-lit");
  });

  it("is lit from the start under reduced motion", () => {
    stubReducedMotion(true);
    render(<TileWord />);

    expect(screen.getByRole("img", { name: "Wpasuj" })).toHaveAttribute("data-lit");
  });

  it("recolours every lit tile when a letter is clicked", async () => {
    stubReducedMotion(false);
    render(<TileWord />);
    act(() => intersection.reveal());
    const before = heats();

    await userEvent.click(screen.getByRole("img", { name: "Wpasuj" }).querySelector("[data-heat]")!);

    heats().forEach((heat, index) => expect(heat).not.toBe(before[index]));
  });

  it("keeps its colours when the motion is stopped", async () => {
    stubReducedMotion(false);
    localStorage.setItem("still-motion", "1");
    render(<TileWord />);
    const before = heats();

    await userEvent.click(screen.getByRole("img", { name: "Wpasuj" }).querySelector("[data-heat]")!);

    expect(heats()).toEqual(before);
  });
});

const heats = () => [...document.querySelectorAll("[data-heat]")].map((tile) => tile.getAttribute("data-heat"));
