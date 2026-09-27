import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Input } from "./input";

describe("Input", () => {
  it("is found by its label and takes typing", async () => {
    render(<Input label="Jak masz na imię?" placeholder="Twoje imię" autoComplete="given-name" />);

    const name = screen.getByRole("textbox", { name: "Jak masz na imię?" });
    await userEvent.type(name, "Ola");

    expect(name).toHaveValue("Ola");
    expect(name).toHaveAttribute("placeholder", "Twoje imię");
    expect(name).toHaveAttribute("autocomplete", "given-name");
  });

  it("offers the big title field of the create form", () => {
    render(<Input label="Co robimy?" variant="title" defaultValue="Planszówki u Michała" />);

    expect(screen.getByRole("textbox", { name: "Co robimy?" })).toHaveAttribute("data-variant", "title");
  });

  it("marks itself invalid and says why", () => {
    render(<Input label="Jak masz na imię?" defaultValue="Ola" error="To imię już jest w tej ankiecie." />);

    const name = screen.getByRole("textbox", { name: "Jak masz na imię?" });
    expect(name).toBeInvalid();
    expect(name).toHaveAccessibleDescription("To imię już jest w tej ankiecie.");
  });

  it("is valid without an error", () => {
    render(<Input label="Jak masz na imię?" />);

    const name = screen.getByRole("textbox", { name: "Jak masz na imię?" });
    expect(name).toBeValid();
    expect(name).not.toHaveAccessibleDescription();
  });
});
