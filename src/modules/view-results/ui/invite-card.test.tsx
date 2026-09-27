import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { markFreshPoll } from "@/shared/fresh-poll";
import { InviteCard } from "./invite-card";

const pollId = "abcdefghij";
const poll = { organiserName: "Kuba", title: "Planszówki u Michała", dates: ["2030-10-18", "2030-10-19", "2030-10-20"], firstHour: 17, lastHour: 23 };
const invite = `Kiedy możecie? Planszówki u Michała ${location.origin}/e/${pollId}`;

function stubSharing(share?: (data: ShareData) => Promise<void>) {
  const writeText = vi.fn(async () => {});
  Object.defineProperty(navigator, "share", { value: share, configurable: true });
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  return writeText;
}

function renderFreshCard() {
  markFreshPoll(pollId);
  return render(<InviteCard pollId={pollId} poll={poll} />);
}

const sendButton = () => screen.getByRole("button", { name: "Wyślij na grupę" });

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

it("shows nothing on a poll this tab did not just create", () => {
  render(<InviteCard pollId={pollId} poll={poll} />);

  expect(screen.queryByRole("button", { name: "Wyślij na grupę" })).not.toBeInTheDocument();
});

it("shows the link preview friends will see, once", () => {
  const { unmount } = renderFreshCard();

  expect(screen.getByText("Ankieta gotowa. Wyślij ją na grupę.")).toBeInTheDocument();
  const preview = screen.getByRole("figure", { name: "Podgląd linku w czacie" });
  expect(preview).toHaveTextContent("Kuba pyta, kiedy możesz");
  expect(preview).toHaveTextContent("Planszówki u Michała");
  expect(preview).toHaveTextContent("pt 18, sb 19, nd 20 października, wieczorem");
  unmount();

  render(<InviteCard pollId={pollId} poll={poll} />);
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

  await act(async () => screen.getByRole("button", { name: "Kopiuj link" }).click());

  expect(writeText).toHaveBeenCalledWith(`${location.origin}/e/${pollId}`);
  expect(screen.getByRole("button", { name: "Skopiowano" })).toBeInTheDocument();
  expect(sendButton()).toBeInTheDocument();
  await act(() => vi.advanceTimersByTimeAsync(1600));
  expect(screen.getByRole("button", { name: "Kopiuj link" })).toBeInTheDocument();
});

it("keeps Skopiowano for the full moment after a second copy", async () => {
  stubSharing();
  renderFreshCard();
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  const copyButton = () => screen.getByRole("button", { name: /Kopiuj link|Skopiowano/ });

  await act(async () => copyButton().click());
  await act(() => vi.advanceTimersByTimeAsync(1000));
  await act(async () => copyButton().click());
  await act(() => vi.advanceTimersByTimeAsync(1000));

  expect(screen.getByRole("button", { name: "Skopiowano" })).toBeInTheDocument();
  await act(() => vi.advanceTimersByTimeAsync(600));
  expect(screen.getByRole("button", { name: "Kopiuj link" })).toBeInTheDocument();
});

it("points at Kopiuj link when sharing fails and the clipboard refuses", async () => {
  Object.defineProperty(navigator, "share", { value: async () => Promise.reject(new DOMException("denied", "NotAllowedError")), configurable: true });
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: async () => Promise.reject(new DOMException("denied", "NotAllowedError")) },
    configurable: true,
  });
  renderFreshCard();

  await userEvent.click(sendButton());

  expect(await screen.findByRole("alert")).toHaveTextContent("Nie udało się wysłać. Skopiuj link przyciskiem „Kopiuj link”.");
});

it("says to copy from the address bar when the clipboard refuses", async () => {
  stubSharing();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: async () => Promise.reject(new DOMException("denied", "NotAllowedError")) },
    configurable: true,
  });
  renderFreshCard();

  await userEvent.click(screen.getByRole("button", { name: "Kopiuj link" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Nie udało się skopiować. Skopiuj link z paska adresu.");
});

it("closes with Gotowe", async () => {
  renderFreshCard();

  await userEvent.click(screen.getByRole("button", { name: "Gotowe" }));

  expect(screen.queryByText("Ankieta gotowa. Wyślij ją na grupę.")).not.toBeInTheDocument();
});

it("copies the whole invite where sharing is unavailable", async () => {
  const writeText = stubSharing();
  renderFreshCard();

  await userEvent.click(sendButton());

  expect(writeText).toHaveBeenCalledWith(invite);
  expect(screen.getAllByRole("button", { name: "Skopiowano" })).toHaveLength(1);
  expect(screen.getByRole("button", { name: "Kopiuj link" })).toBeInTheDocument();
});
