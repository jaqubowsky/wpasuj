import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Cell } from "./cell";

describe("Cell", () => {
  it("shows free or mine on the answer grid and leaves announcing it to the grid", () => {
    render(
      <>
        <Cell aria-label="sb 19:00" />
        <Cell state="mine" aria-label="sb 20:00" />
      </>,
    );

    expect(screen.getByRole("button", { name: "sb 19:00" })).not.toHaveAttribute("data-state");
    expect(screen.getByRole("button", { name: "sb 20:00" })).toHaveAttribute("data-state", "mine");
    expect(screen.getByRole("button", { name: "sb 20:00" })).not.toHaveAttribute("aria-pressed");
  });

  it("asks to toggle on a tap", async () => {
    const onClick = vi.fn();

    render(<Cell aria-label="sb 19:00" onClick={onClick} />);

    await userEvent.click(screen.getByRole("button", { name: "sb 19:00" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("previews a stroke that adds or removes", () => {
    render(
      <>
        <Cell state="adding" aria-label="dodaję" />
        <Cell state="removing" aria-label="usuwam" />
      </>,
    );

    expect(screen.getByRole("button", { name: "dodaję" })).toHaveAttribute("data-state", "adding");
    expect(screen.getByRole("button", { name: "usuwam" })).toHaveAttribute("data-state", "removing");
  });

  it("shows the count of a heat cell with its level and asks who can on a tap", async () => {
    const onClick = vi.fn();

    render(
      <Cell heat={3} aria-label="sb 19:00" onClick={onClick}>
        3
      </Cell>,
    );

    const cell = screen.getByRole("button", { name: "sb 19:00" });

    expect(cell).toHaveTextContent("3");
    expect(cell).toHaveAttribute("data-heat", "3");
    expect(cell).not.toHaveAttribute("aria-pressed");
    await userEvent.click(cell);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is a free tile with no heat where nobody can", () => {
    render(<Cell heat={0} aria-label="sb 19:00" />);

    expect(screen.getByRole("button", { name: "sb 19:00" })).not.toHaveAttribute("data-heat");
  });

  it("rings the heat cell someone tapped to see who can", () => {
    render(
      <>
        <Cell heat={3} selected aria-label="sb 19:00">
          3
        </Cell>
        <Cell heat={3} aria-label="sb 20:00">
          3
        </Cell>
      </>,
    );

    expect(screen.getByRole("button", { name: "sb 19:00" })).toHaveAttribute("data-selected");
    expect(screen.getByRole("button", { name: "sb 20:00" })).not.toHaveAttribute("data-selected");
  });
});
