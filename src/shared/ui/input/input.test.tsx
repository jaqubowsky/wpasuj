import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Input } from "./input";

function TitleField() {
  const [title, setTitle] = useState("");

  return (
    <>
      <Input label="Co robimy?" value={title} onChange={(event) => setTitle(event.target.value)} />
      <output>{title}</output>
    </>
  );
}

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

  it("sets a note beside a small label", () => {
    render(<Input label="Twoje imię" variant="compact" labelAside={<span>Zapisane</span>} defaultValue="Zuza" />);

    expect(screen.getByRole("textbox", { name: "Twoje imię" })).toHaveAttribute("data-variant", "compact");
    expect(screen.getByText("Zapisane")).toBeVisible();
  });

  it("keeps what was typed before the page hydrated", () => {
    const container = document.body.appendChild(document.createElement("div"));

    container.innerHTML = renderToString(<TitleField />);
    (screen.getByRole("textbox", { name: "Co robimy?" }) as HTMLInputElement).value = "Kino";

    render(<TitleField />, { container, hydrate: true });

    expect(screen.getByRole("status")).toHaveTextContent("Kino");
    expect(screen.getByRole("textbox", { name: "Co robimy?" })).toHaveValue("Kino");
  });
});
