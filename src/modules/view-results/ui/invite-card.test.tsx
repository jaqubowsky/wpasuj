import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { markFreshPoll } from "@/shared/fresh-poll";
import { InviteCard } from "./invite-card";

const pollId = "abcdefghij";
const title = "Planszówki u Michała";
const invite = `Kiedy możecie? Planszówki u Michała ${location.origin}/e/${pollId}`;

function stubSharing(share?: (data: ShareData) => Promise<void>) {
  const writeText = vi.fn(async () => {});

  Object.defineProperty(navigator, "share", { value: share, configurable: true });
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

  return writeText;
}

function refuseClipboard() {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: async () => Promise.reject(new DOMException("denied", "NotAllowedError")) },
    configurable: true,
  });
}

function renderFreshCard() {
  markFreshPoll(pollId);

  return render(<InviteCard pollId={pollId} title={title} />);
}

const sendButton = () => screen.getByRole("button", { name: "Wyślij na grupę" });

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

it("shows nothing on a poll this tab did not just create", () => {
  render(<InviteCard pollId={pollId} title={title} />);

  expect(screen.queryByRole("button", { name: "Wyślij na grupę" })).not.toBeInTheDocument();
});

it("shows the link to send, once", () => {
  const { unmount } = renderFreshCard();

  const card = screen.getByRole("region", { name: "Ankieta gotowa" });

  expect(card).toHaveTextContent("Wyślij link znajomym na grupę");
  expect(card).toHaveTextContent(`${location.host}/e/${pollId}`);
  unmount();

  render(<InviteCard pollId={pollId} title={title} />);
  expect(screen.queryByRole("button", { name: "Wyślij na grupę" })).not.toBeInTheDocument();
});

it("opens the share sheet from its own tap with the invite and folds after sending", async () => {
  const share = vi.fn(async () => {});

  stubSharing(share);
  renderFreshCard();

  await userEvent.click(sendButton());

  expect(share).toHaveBeenCalledExactlyOnceWith({ text: invite });
  expect(await screen.findByText("Wysłane. Odpowiedzi pojawią się tutaj.")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Wyślij na grupę" })).not.toBeInTheDocument();
});

it("keeps the card when the share sheet is closed without sending", async () => {
  stubSharing(async () => Promise.reject(new DOMException("closed", "AbortError")));
  renderFreshCard();

  await userEvent.click(sendButton());

  expect(sendButton()).toBeInTheDocument();
  expect(screen.queryByText("Wysłane. Odpowiedzi pojawią się tutaj.")).not.toBeInTheDocument();
});

it("copies the link, says Skopiowano for a moment and keeps the card", async () => {
  const writeText = stubSharing();

  renderFreshCard();
  vi.useFakeTimers({ toFake: ["setTimeout"] });

  await act(async () => screen.getByRole("button", { name: "Kopiuj" }).click());

  expect(writeText).toHaveBeenCalledWith(`${location.origin}/e/${pollId}`);
  expect(screen.getByRole("button", { name: "Skopiowano" })).toBeInTheDocument();
  expect(sendButton()).toBeInTheDocument();
  await act(() => vi.advanceTimersByTimeAsync(1600));
  expect(screen.getByRole("button", { name: "Kopiuj" })).toBeInTheDocument();
});

it("keeps Skopiowano for the full moment after a second copy", async () => {
  stubSharing();
  renderFreshCard();
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  const copyButton = () => screen.getByRole("button", { name: /Kopiuj|Skopiowano/ });

  await act(async () => copyButton().click());
  await act(() => vi.advanceTimersByTimeAsync(1000));
  await act(async () => copyButton().click());
  await act(() => vi.advanceTimersByTimeAsync(1000));

  expect(screen.getByRole("button", { name: "Skopiowano" })).toBeInTheDocument();
  await act(() => vi.advanceTimersByTimeAsync(600));
  expect(screen.getByRole("button", { name: "Kopiuj" })).toBeInTheDocument();
});

it("points at Kopiuj when sharing fails and the clipboard refuses", async () => {
  Object.defineProperty(navigator, "share", {
    value: async () => Promise.reject(new DOMException("denied", "NotAllowedError")),
    configurable: true,
  });

  refuseClipboard();
  renderFreshCard();

  await userEvent.click(sendButton());

  expect(await screen.findByRole("alert")).toHaveTextContent("Nie udało się wysłać. Skopiuj link przyciskiem „Kopiuj”.");
});

it("says to copy from the address bar when the clipboard refuses", async () => {
  stubSharing();
  refuseClipboard();
  renderFreshCard();

  await userEvent.click(screen.getByRole("button", { name: "Kopiuj" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Nie udało się skopiować. Skopiuj link z paska adresu.");
});

it("copies the whole invite where sharing is unavailable", async () => {
  const writeText = stubSharing();

  renderFreshCard();

  await userEvent.click(sendButton());

  expect(writeText).toHaveBeenCalledWith(invite);
  expect(screen.getAllByRole("button", { name: "Skopiowano" })).toHaveLength(1);
  expect(screen.getByRole("button", { name: "Kopiuj" })).toBeInTheDocument();
});
