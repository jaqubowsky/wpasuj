import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PosterCard } from "./poster-card";
import { stubReducedMotion } from "@/shared/testing/motion";

beforeEach(() => {
  localStorage.clear();
  stubReducedMotion(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.querySelectorAll("[data-tile-burst]").forEach((tile) => tile.remove());
});

const grill = { title: "Grill u Oli", when: "sb 3.10", people: "6 osób", tone: "coral", heat: [1, 2, 4, 0, 3, 5, 4, 1, 0, 2] } as const;

describe("PosterCard", () => {
  it("shows the poll's title, its people and its time", () => {
    render(<PosterCard {...grill} />);

    const poster = screen.getByRole("button", { name: "Grill u Oli, sb 3.10", pressed: false });

    expect(poster).toHaveTextContent("Grill u Oli");
    expect(poster).toHaveTextContent("6 osób");
    expect(poster).toHaveTextContent("sb 3.10");
  });

  it("flips to the settled time with a burst of tiles, and back", async () => {
    render(<PosterCard {...grill} />);

    await userEvent.click(screen.getByRole("button", { name: "Grill u Oli, sb 3.10" }));

    const poster = screen.getByRole("button", { name: "Grill u Oli, sb 3.10", pressed: true });

    expect(poster).toHaveTextContent("Ustalone");
    expect(document.querySelectorAll("[data-tile-burst]").length).toBeGreaterThan(0);

    await userEvent.click(poster);

    expect(screen.getByRole("button", { name: "Grill u Oli, sb 3.10", pressed: false })).toBeInTheDocument();
  });
});
