import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAnswer, type Answer } from "./use-answer";

vi.mock("./answer-actions", () => ({ saveAnswer: vi.fn(), claimName: vi.fn() }));

function NameField({ mine }: { mine?: Answer }) {
  const { attachNameField, declineClaim } = useAnswer({ pollId: "Planszowki", dates: ["2026-10-16"], hours: [19], mine });
  return (
    <>
      <button type="button" onClick={declineClaim}>
        Nie, zmienię imię
      </button>
      <input aria-label="imię" ref={attachNameField} />
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("useAnswer focus", () => {
  it("puts the cursor in the name field on load when this device has no name yet", () => {
    render(<NameField />);

    expect(screen.getByRole("textbox", { name: "imię" })).toHaveFocus();
  });

  it("leaves the field alone when a last name is stored", () => {
    localStorage.setItem("last-name", "Ola");

    render(<NameField />);

    expect(screen.getByRole("textbox", { name: "imię" })).not.toHaveFocus();
  });

  it("leaves the field alone for a device that already answered", () => {
    render(<NameField mine={{ name: "Ola", slots: [] }} />);

    expect(screen.getByRole("textbox", { name: "imię" })).not.toHaveFocus();
  });

  it("moves the cursor to the name field when the participant picks another name", async () => {
    render(<NameField mine={{ name: "Ola", slots: [] }} />);

    await userEvent.click(screen.getByRole("button", { name: "Nie, zmienię imię" }));

    expect(screen.getByRole("textbox", { name: "imię" })).toHaveFocus();
  });
});
