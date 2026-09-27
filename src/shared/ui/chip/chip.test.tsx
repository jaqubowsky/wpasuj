import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Chip } from "./chip";

describe("Chip", () => {
  it("shows whether its preset is on", () => {
    render(
      <>
        <Chip pressed={false}>Dziś</Chip>
        <Chip pressed>Ten weekend</Chip>
      </>,
    );

    expect(screen.getByRole("button", { name: "Dziś", pressed: false })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ten weekend", pressed: true })).toBeInTheDocument();
  });

  it("asks to toggle on a tap", async () => {
    const onClick = vi.fn();
    render(
      <Chip pressed={false} onClick={onClick}>
        Przyszły tydzień
      </Chip>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Przyszły tydzień" }));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
