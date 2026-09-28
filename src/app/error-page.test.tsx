import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { ErrorPage } from "./error-page";

it("says something went wrong, tries again on a tap and links to a new poll", async () => {
  const retry = vi.fn();

  render(<ErrorPage retry={retry} />);
  await userEvent.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));

  expect(screen.getByRole("heading", { name: "Coś poszło nie tak" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Zrób własną ankietę" })).toHaveAttribute("href", "/");
  expect(retry).toHaveBeenCalledOnce();
});
