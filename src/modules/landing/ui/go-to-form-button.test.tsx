import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { GoToFormButton } from "./go-to-form-button";

it("brings the form into view and puts the cursor in its first field", async () => {
  const scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  render(
    <>
      <div id="utworz">
        <input aria-label="Co robimy?" />
        <input aria-label="Twoje imię" />
      </div>
      <GoToFormButton formId="utworz" />
    </>,
  );

  await userEvent.click(screen.getByRole("button", { name: "Utwórz ankietę" }));

  expect(scrollIntoView.mock.contexts).toEqual([document.getElementById("utworz")]);
  expect(screen.getByRole("textbox", { name: "Co robimy?" })).toHaveFocus();
});
