import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { TitleInput } from "./title-input";

function TitleForm({ onSubmit = () => {} }: { onSubmit?: () => void }) {
  const [title, setTitle] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <TitleInput label="Co robimy?" placeholder="Co robimy?" value={title} onChange={(event) => setTitle(event.target.value)} />
      <output>{title}</output>
    </form>
  );
}

describe("TitleInput", () => {
  it("is found by its label and takes typing", async () => {
    render(<TitleForm />);

    await userEvent.type(screen.getByRole("textbox", { name: "Co robimy?" }), "Grill u Oli");

    expect(screen.getByRole("status")).toHaveTextContent("Grill u Oli");
  });

  it("sends the form on Enter instead of breaking the line", async () => {
    const onSubmit = vi.fn();

    render(<TitleForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByRole("textbox", { name: "Co robimy?" }), "Kino{Enter}");

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(screen.getByRole("textbox", { name: "Co robimy?" })).toHaveValue("Kino");
  });

  it("keeps a pasted title on one line", async () => {
    render(<TitleForm />);

    await userEvent.click(screen.getByRole("textbox", { name: "Co robimy?" }));
    await userEvent.paste("Grill\n u Oli");

    expect(screen.getByRole("status").textContent).toBe("Grill u Oli");
  });

  it("marks itself invalid and says why", () => {
    render(<TitleInput label="Co robimy?" defaultValue="" error="Wpisz, co robicie" />);

    const title = screen.getByRole("textbox", { name: "Co robimy?" });

    expect(title).toBeInvalid();
    expect(title).toHaveAccessibleDescription("Wpisz, co robicie");
  });

  it("keeps what was typed before the page hydrated", () => {
    const container = document.body.appendChild(document.createElement("div"));

    container.innerHTML = renderToString(<TitleForm />);
    (screen.getByRole("textbox", { name: "Co robimy?" }) as HTMLTextAreaElement).value = "Kino";

    render(<TitleForm />, { container, hydrate: true });

    expect(screen.getByRole("status")).toHaveTextContent("Kino");
  });
});
