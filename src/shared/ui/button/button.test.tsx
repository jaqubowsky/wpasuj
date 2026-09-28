import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("runs its action on a tap without submitting a surrounding form", async () => {
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    const onClick = vi.fn();

    render(
      <form onSubmit={(event) => onSubmit(event.nativeEvent)}>
        <Button onClick={onClick}>Przypomnij</Button>
      </form>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Przypomnij" }));

    expect(onClick).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits its form when asked to", async () => {
    const onSubmit = vi.fn((event: Event) => event.preventDefault());

    render(
      <form onSubmit={(event) => onSubmit(event.nativeEvent)}>
        <Button type="submit" variant="primary" block>
          Utwórz i wyślij na grupę
        </Button>
      </form>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Utwórz i wyślij na grupę" }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("shows the primary, secondary, on-dark, text and small looks of the preview", () => {
    render(
      <>
        <Button variant="primary" block>
          Utwórz i wyślij na grupę
        </Button>
        <Button>Przypomnij</Button>
        <Button size="small">Więcej</Button>
        <Button variant="on-dark" block>
          Ustal ten termin
        </Button>
        <Button variant="text">Nie mogę w żadnym terminie</Button>
      </>,
    );

    const primary = screen.getByRole("button", { name: "Utwórz i wyślij na grupę" });

    expect(primary).toHaveAttribute("data-variant", "primary");
    expect(primary).toHaveAttribute("data-block");
    expect(screen.getByRole("button", { name: "Przypomnij" })).not.toHaveAttribute("data-variant");
    expect(screen.getByRole("button", { name: "Więcej" })).toHaveAttribute("data-size", "small");
    expect(screen.getByRole("button", { name: "Ustal ten termin" })).toHaveAttribute("data-variant", "on-dark");
    expect(screen.getByRole("button", { name: "Nie mogę w żadnym terminie" })).toHaveAttribute("data-variant", "text");
  });

  it("ignores taps while disabled", async () => {
    const onClick = vi.fn();

    render(
      <Button variant="primary" disabled onClick={onClick}>
        Wyłączony
      </Button>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Wyłączony" }));

    expect(onClick).not.toHaveBeenCalled();
  });
});
