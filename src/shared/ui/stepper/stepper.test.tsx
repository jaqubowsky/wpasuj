import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Stepper } from "./stepper";

describe("Stepper", () => {
  it("shows its value under its label", () => {
    render(<Stepper label="od" value={17} min={0} max={23} onChange={() => {}} />);

    expect(within(screen.getByRole("group", { name: "od" })).getByRole("status")).toHaveTextContent("17");
  });

  it("steps one down and one up", async () => {
    const onChange = vi.fn();
    render(<Stepper label="od" value={17} min={0} max={23} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Wcześniej" }));
    await userEvent.click(screen.getByRole("button", { name: "Później" }));

    expect(onChange.mock.calls).toEqual([[16], [18]]);
  });

  it("stops at its bounds", () => {
    render(<Stepper label="do" value={24} min={18} max={24} onChange={() => {}} />);

    expect(screen.getByRole("button", { name: "Później" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Wcześniej" })).toBeEnabled();
  });

  it("stops at its lower bound", () => {
    render(<Stepper label="od" value={0} min={0} max={23} onChange={() => {}} />);

    expect(screen.getByRole("button", { name: "Wcześniej" })).toBeDisabled();
  });
});
