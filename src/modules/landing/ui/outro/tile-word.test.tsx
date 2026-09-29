import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TileWord } from "./tile-word";
import { stubReducedMotion, stubIntersection } from "@/shared/testing/motion";

let intersection: ReturnType<typeof stubIntersection>;

beforeEach(() => {
  localStorage.clear();

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
});
