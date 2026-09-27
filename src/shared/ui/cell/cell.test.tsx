import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Cell } from "./cell";

describe("Cell", () => {
  it("is a toggle on the answer grid, free or mine", () => {
    render(
      <>
        <Cell pressed={false} aria-label="sb 19:00" />
        <Cell pressed state="mine" aria-label="sb 20:00" />
      </>,
    );

    expect(screen.getByRole("button", { name: "sb 19:00", pressed: false })).not.toHaveAttribute("data-state");
    expect(screen.getByRole("button", { name: "sb 20:00", pressed: true })).toHaveAttribute("data-state", "mine");
  });

  it("asks to toggle on a tap", async () => {
    const onClick = vi.fn();
    render(<Cell pressed={false} aria-label="sb 19:00" onClick={onClick} />);

    await userEvent.click(screen.getByRole("button", { name: "sb 19:00" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("previews a stroke that adds or removes", () => {
    render(
      <>
        <Cell pressed={false} state="adding" aria-label="dodaję" />
        <Cell pressed state="removing" aria-label="usuwam" />
      </>,
    );

    expect(screen.getByRole("button", { name: "dodaję" })).toHaveAttribute("data-state", "adding");
    expect(screen.getByRole("button", { name: "usuwam" })).toHaveAttribute("data-state", "removing");
  });

  it("shows the count of a heat cell with its level", () => {
    render(<Cell heat={3}>3</Cell>);

    const cell = screen.getByText("3");
    expect(cell).toHaveAttribute("data-heat", "3");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("marks a heat cell where everyone is free and the best time", () => {
    render(
      <>
        <Cell heat={5} everyone>
          6
        </Cell>
        <Cell heat={5} best>
          5
        </Cell>
      </>,
    );

    expect(screen.getByText("6")).toHaveAttribute("data-everyone");
    expect(screen.getByText("6")).not.toHaveAttribute("data-best");
    expect(screen.getByText("5")).toHaveAttribute("data-best");
  });
});
