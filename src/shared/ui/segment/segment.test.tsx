import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Segment } from "./segment";

const views = ["Moje", "Wszyscy"] as const;
const panels = { Moje: <p>moja siatka</p>, Wszyscy: <p>wyniki</p> };

describe("Segment", () => {
  it("marks the selected view among its tabs", () => {
    render(<Segment label="Widok" options={views} selected="Wszyscy" onSelect={() => {}} panels={panels} />);

    expect(screen.getByRole("tablist", { name: "Widok" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Moje", selected: false })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Wszyscy", selected: true })).toBeInTheDocument();
  });

  it("shows the selected view's panel, named by its tab", () => {
    render(<Segment label="Widok" options={views} selected="Wszyscy" onSelect={() => {}} panels={panels} />);

    expect(screen.getByRole("tabpanel", { name: "Wszyscy" })).toHaveTextContent("wyniki");
    expect(screen.queryByRole("tabpanel", { name: "Moje" })).not.toBeInTheDocument();
  });

  it("keeps the other views mounted and hidden, so switching back loses nothing", () => {
    render(<Segment label="Widok" options={views} selected="Wszyscy" onSelect={() => {}} panels={panels} />);

    expect(screen.getByText("moja siatka")).not.toBeVisible();
  });

  it("switches to the tapped view", async () => {
    const onSelect = vi.fn();
    render(<Segment label="Widok" options={views} selected="Wszyscy" onSelect={onSelect} panels={panels} />);

    await userEvent.click(screen.getByRole("tab", { name: "Moje" }));

    expect(onSelect).toHaveBeenCalledWith("Moje");
  });

  it("is one tab stop, and arrows move to the next view and select it", async () => {
    const onSelect = vi.fn();
    render(<Segment label="Widok" options={views} selected="Moje" onSelect={onSelect} panels={panels} />);

    await userEvent.tab();
    expect(screen.getByRole("tab", { name: "Moje" })).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Wszyscy" })).toHaveFocus();
    expect(onSelect).toHaveBeenLastCalledWith("Wszyscy");

    await userEvent.keyboard("{ArrowRight}");
    expect(onSelect).toHaveBeenLastCalledWith("Moje");

    await userEvent.keyboard("{ArrowLeft}");
    expect(onSelect).toHaveBeenLastCalledWith("Wszyscy");
  });
});
