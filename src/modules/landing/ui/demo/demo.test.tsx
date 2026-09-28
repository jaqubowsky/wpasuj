import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { Demo } from "./demo";

function bestTime() {
  return within(screen.getByRole("status", { name: "Najlepiej" }));
}

it("recomputes the best time when the visitor taps an hour and resets it", async () => {
  render(<Demo formId="utworz" />);
  expect(bestTime().getByText("Sobota 18.10, 19–21")).toBeInTheDocument();
  expect(bestTime().getByText("Nie może: Ty")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "sb 18, 19:00, 4 z 5 może" }));

  expect(screen.getByRole("button", { name: "sb 18, 19:00, 5 z 5 może" })).toBeInTheDocument();
  expect(bestTime().getByText("Sobota 18.10, 19–20")).toBeInTheDocument();
  expect(bestTime().getByText("5 z 5 może")).toBeInTheDocument();
  expect(bestTime().getByText("Wszyscy mogą")).toBeInTheDocument();
  expect(screen.getByRole("list", { name: "Też dobre" })).toHaveTextContent("sb 18.10, 20–214 z 5");

  await userEvent.click(screen.getByRole("button", { name: "Wyczyść moje godziny" }));

  expect(bestTime().getByText("Sobota 18.10, 19–21")).toBeInTheDocument();
  expect(screen.queryAllByRole("gridcell", { selected: true })).toHaveLength(0);
});

it("brings the hero form into view from its call to action", async () => {
  Element.prototype.scrollIntoView = vi.fn();

  render(
    <>
      <div id="utworz">
        <input aria-label="Co robimy?" />
      </div>
      <Demo formId="utworz" />
    </>,
  );

  await userEvent.click(screen.getByRole("button", { name: "Zrób taką ankietę dla swojej paczki" }));

  expect(screen.getByRole("textbox", { name: "Co robimy?" })).toHaveFocus();
});
