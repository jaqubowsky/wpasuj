import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { GridMark } from "@/shared/ui/grid-mark/grid-mark";
import { ErrorPage } from "./error-page";

it("says something went wrong, tries again on a tap and links to a new poll", async () => {
  const retry = vi.fn();

  render(<ErrorPage retry={retry} />);
  await userEvent.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));

  expect(screen.getByRole("heading", { name: "Coś poszło nie tak" })).toBeInTheDocument();
  expect(screen.getByText("Spróbuj jeszcze raz. Jeśli dalej nie działa, zrób własną ankietę.")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Zrób własną ankietę" })).toHaveAttribute("href", "/");
  expect(retry).toHaveBeenCalledOnce();
});

it("shows the gone-poll page's grid mark above its heading", () => {
  render(<ErrorPage retry={vi.fn()} />);

  expect(screen.getByRole("heading", { name: "Coś poszło nie tak" }).previousElementSibling?.outerHTML).toBe(
    renderToStaticMarkup(<GridMark />),
  );
});
