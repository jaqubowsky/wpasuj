import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { CreatePollDraft, DraftLinkPreview } from "./create-poll-draft";
import { CreatePollForm } from "./create-poll-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("../server/create-poll-action", () => ({ createPoll: vi.fn() }));

beforeEach(() => localStorage.clear());

it("previews the link as friends will see it while the organiser types", async () => {
  render(
    <CreatePollDraft>
      <DraftLinkPreview host="wpasuj.pl" />
      <CreatePollForm />
    </CreatePollDraft>,
  );

  expect(screen.getByRole("figure", { name: "Wasz plan" })).toHaveTextContent("Ty pytasz, kiedy możesz");

  await userEvent.type(screen.getByRole("textbox", { name: "Co robimy?" }), "Grill u Oli");
  await userEvent.type(screen.getByRole("textbox", { name: "Twoje imię" }), "Kuba");

  expect(screen.getByRole("figure", { name: "Grill u Oli" })).toHaveTextContent("Kuba pyta, kiedy możesz");
});

it("leaves the form working without a preview", async () => {
  render(<CreatePollForm />);

  await userEvent.type(screen.getByRole("textbox", { name: "Co robimy?" }), "Kino");

  expect(screen.getByRole("textbox", { name: "Co robimy?" })).toHaveValue("Kino");
});
