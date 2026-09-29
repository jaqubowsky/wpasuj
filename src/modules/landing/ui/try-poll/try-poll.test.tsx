import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TryPoll } from "./try-poll";

const best = () => screen.getByRole("status");

describe("TryPoll", () => {
  it("shows the best time of the five who answered", () => {
    render(<TryPoll />);

    expect(best()).toHaveTextContent("Najlepiej terazSobota, 20:004 z 6");
    expect(best()).not.toHaveAttribute("data-pulse");
    expect(screen.getByRole("button", { name: "Sobota, 20:00, 4 z 6", pressed: false })).toBeInTheDocument();
  });

  it("adds your tap to the slot, moves the best time there and pulses it", async () => {
    render(<TryPoll />);

    await userEvent.click(screen.getByRole("button", { name: "Sobota, 21:00, 4 z 6" }));

    expect(screen.getByRole("button", { name: "Sobota, 21:00, 5 z 6", pressed: true })).toHaveTextContent("5");
    expect(best()).toHaveTextContent("Sobota, 21:005 z 6");
    expect(best()).toHaveAttribute("data-pulse");
  });

  it("leaves the best time still when a tap does not move it", async () => {
    render(<TryPoll />);

    await userEvent.click(screen.getByRole("button", { name: "Poniedziałek, 18:00, 0 z 6" }));

    expect(best()).toHaveTextContent("Sobota, 20:004 z 6");
    expect(best()).not.toHaveAttribute("data-pulse");
  });
});
