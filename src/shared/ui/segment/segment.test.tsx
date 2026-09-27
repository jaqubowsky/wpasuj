import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Segment } from "./segment";

describe("Segment", () => {
  it("marks the selected view among its tabs", () => {
    render(<Segment label="Widok" options={["Moje", "Wszyscy"]} selected="Wszyscy" onSelect={() => {}} />);

    expect(screen.getByRole("tablist", { name: "Widok" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Moje", selected: false })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Wszyscy", selected: true })).toBeInTheDocument();
  });

  it("switches to the tapped view", async () => {
    const onSelect = vi.fn();
    render(<Segment label="Widok" options={["Moje", "Wszyscy"]} selected="Wszyscy" onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("tab", { name: "Moje" }));

    expect(onSelect).toHaveBeenCalledWith("Moje");
  });
});
