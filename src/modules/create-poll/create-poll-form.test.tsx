import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreatePollForm } from "./create-poll-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const createPoll = vi.fn();
vi.mock("./create-poll-action", () => ({ createPoll: (input: unknown) => createPoll(input) }));

const thursdayMorning = new Date(2026, 9, 15, 9);

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

async function createWithFakeTimeouts() {
  vi.useFakeTimers({ toFake: ["Date", "setTimeout"], now: thursdayMorning });
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Utwórz i wyślij na grupę" })));
}

async function fillIn(day: string) {
  await userEvent.type(screen.getByRole("textbox", { name: "Co robimy?" }), "Kino");
  await userEvent.click(screen.getByRole("button", { name: day }));
  await userEvent.type(screen.getByRole("textbox", { name: "Twoje imię" }), "Kuba");
}

function date(name: RegExp) {
  return screen.getByRole("button", { name });
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(thursdayMorning);
  localStorage.clear();
  push.mockReset();
  createPoll.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Kiedy?", () => {
  it("Ten weekend selects Friday to Sunday and lights up", async () => {
    render(<CreatePollForm />);

    await userEvent.click(screen.getByRole("button", { name: "Ten weekend" }));

    expect(screen.getByRole("button", { name: "Ten weekend", pressed: true })).toBeInTheDocument();
    expect(date(/^piątek, 16 października/)).toHaveAttribute("aria-pressed", "true");
    expect(date(/^niedziela, 18 października/)).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("pt 16, sb 17, nd 18 października")).toBeInTheDocument();
  });

  it("unticking one weekend date turns the chip off", async () => {
    render(<CreatePollForm />);
    await userEvent.click(screen.getByRole("button", { name: "Ten weekend" }));

    await userEvent.click(date(/^sobota, 17 października/));

    expect(screen.getByRole("button", { name: "Ten weekend", pressed: false })).toBeInTheDocument();
  });

  it("past days cannot be picked", () => {
    render(<CreatePollForm />);

    expect(date(/^środa, 14 października/)).toBeDisabled();
    expect(date(/^czwartek, 15 października/)).toBeEnabled();
  });

  it("an 11th date changes nothing and says Maksymalnie 10 dni", async () => {
    render(<CreatePollForm />);
    await userEvent.click(screen.getByRole("button", { name: "Przyszły tydzień" }));
    await userEvent.click(screen.getByRole("button", { name: "Ten weekend" }));

    await userEvent.click(date(/^czwartek, 15 października/));

    expect(screen.getByText("Maksymalnie 10 dni")).toBeInTheDocument();
    expect(date(/^czwartek, 15 października/)).toHaveAttribute("aria-pressed", "false");
  });

  it("Pokaż cały miesiąc shows six weeks of dates", async () => {
    render(<CreatePollForm />);
    expect(screen.queryByRole("button", { name: /^poniedziałek, 26 października/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Pokaż cały miesiąc" }));

    expect(date(/^niedziela, 22 listopada/)).toBeInTheDocument();
  });
});

describe("O której?", () => {
  it("keeps Wieczór 17–23 by default and Własne reveals od and do", async () => {
    render(<CreatePollForm />);
    expect(screen.getByRole("button", { name: "Wieczór 17–23", pressed: true })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "od" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Własne" }));

    const from = screen.getByRole("group", { name: "od" });
    const to = screen.getByRole("group", { name: "do" });
    expect(within(from).getByRole("status")).toHaveTextContent("17");
    expect(within(to).getByRole("status")).toHaveTextContent("23");
  });
});

describe("Utwórz i wyślij na grupę", () => {
  it("says what is missing instead of creating", async () => {
    render(<CreatePollForm />);

    await userEvent.click(screen.getByRole("button", { name: "Utwórz i wyślij na grupę" }));

    expect(screen.getByText("Wpisz, co robicie")).toBeInTheDocument();
    expect(screen.getByText("Wybierz co najmniej jeden dzień")).toBeInTheDocument();
    expect(screen.getByText("Wpisz swoje imię")).toBeInTheDocument();
    expect(createPoll).not.toHaveBeenCalled();
  });

  it("creates the poll, shares the invitation and lands on the poll", async () => {
    const share = vi.fn(async () => {});
    stubSharing(share);
    createPoll.mockResolvedValue({ ok: true, id: "abcdefghij" });
    render(<CreatePollForm />);

    await userEvent.type(screen.getByRole("textbox", { name: "Co robimy?" }), "Kino");
    await userEvent.click(screen.getByRole("button", { name: "Ten weekend" }));
    await userEvent.click(screen.getByRole("button", { name: "Własne" }));
    await userEvent.click(within(screen.getByRole("group", { name: "od" })).getByRole("button", { name: "Później" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Twoje imię" }), "Kuba");
    await userEvent.click(screen.getByRole("button", { name: "Utwórz i wyślij na grupę" }));

    expect(createPoll).toHaveBeenCalledWith({
      title: "Kino",
      dates: ["2026-10-16", "2026-10-17", "2026-10-18"],
      firstHour: 18,
      lastHour: 23,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      organiserName: "Kuba",
    });
    expect(share).toHaveBeenCalledWith({ text: `Kiedy możecie? Kino ${location.origin}/e/abcdefghij` });
    expect(push).toHaveBeenCalledWith("/e/abcdefghij");
  });

  it("copies the link where sharing is unavailable and says so", async () => {
    const writeText = stubSharing();
    createPoll.mockResolvedValue({ ok: true, id: "abcdefghij" });
    render(<CreatePollForm />);
    await fillIn("Jutro");

    await userEvent.click(screen.getByRole("button", { name: "Utwórz i wyślij na grupę" }));

    expect(writeText).toHaveBeenCalledWith(`${location.origin}/e/abcdefghij`);
    expect(screen.getByText("Link skopiowany")).toBeInTheDocument();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/e/abcdefghij"), { timeout: 2000 });
  });

  it("a second tap while Link skopiowany shows creates nothing", async () => {
    stubSharing();
    createPoll.mockResolvedValue({ ok: true, id: "abcdefghij" });
    render(<CreatePollForm />);
    await fillIn("Jutro");
    await userEvent.click(screen.getByRole("button", { name: "Utwórz i wyślij na grupę" }));
    expect(screen.getByText("Link skopiowany")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Utwórz i wyślij na grupę" }));

    await waitFor(() => expect(push).toHaveBeenCalledTimes(1), { timeout: 2000 });
    expect(createPoll).toHaveBeenCalledTimes(1);
  });

  it("prefills the name used last on this device", async () => {
    stubSharing(async () => {});
    createPoll.mockResolvedValue({ ok: true, id: "abcdefghij" });
    const { unmount } = render(<CreatePollForm />);
    await fillIn("Jutro");
    await userEvent.click(screen.getByRole("button", { name: "Utwórz i wyślij na grupę" }));
    unmount();

    render(<CreatePollForm />);

    expect(screen.getByRole("textbox", { name: "Twoje imię" })).toHaveValue("Kuba");
  });

  it("says the poll was not created when the server refuses it", async () => {
    createPoll.mockResolvedValue({ ok: false, reason: "invalid" });
    render(<CreatePollForm />);
    await fillIn("Dziś");

    await act(() => userEvent.click(screen.getByRole("button", { name: "Utwórz i wyślij na grupę" })));

    expect(screen.getByText("Nie udało się utworzyć ankiety. Sprawdź daty i spróbuj jeszcze raz.")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("says something went wrong when creating throws and lets the organiser try again", async () => {
    stubSharing(async () => {});
    createPoll.mockRejectedValueOnce(new Error("database is locked")).mockResolvedValueOnce({ ok: true, id: "abcdefghij" });
    render(<CreatePollForm />);
    await fillIn("Dziś");

    await act(() => userEvent.click(screen.getByRole("button", { name: "Utwórz i wyślij na grupę" })));
    expect(screen.getByText("Coś poszło nie tak. Spróbuj jeszcze raz.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Utwórz i wyślij na grupę" }));

    expect(push).toHaveBeenCalledWith("/e/abcdefghij");
  });

  it("says the link was not copied for 4 s, then lands on the poll", async () => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    refuseClipboard();
    createPoll.mockResolvedValue({ ok: true, id: "abcdefghij" });
    render(<CreatePollForm />);
    await fillIn("Dziś");

    await createWithFakeTimeouts();
    await act(() => vi.advanceTimersByTimeAsync(3999));

    expect(screen.getByText("Nie udało się skopiować linku. Skopiuj go z paska adresu.")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(push).toHaveBeenCalledWith("/e/abcdefghij");
  });

  it("says to copy the link from the address bar when sharing and copying both fail", async () => {
    Object.defineProperty(navigator, "share", {
      value: async () => Promise.reject(new DOMException("denied", "NotAllowedError")),
      configurable: true,
    });
    refuseClipboard();
    createPoll.mockResolvedValue({ ok: true, id: "abcdefghij" });
    render(<CreatePollForm />);
    await fillIn("Dziś");

    await createWithFakeTimeouts();

    expect(screen.getByText("Nie udało się skopiować linku. Skopiuj go z paska adresu.")).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(4000));
    expect(push).toHaveBeenCalledWith("/e/abcdefghij");
  });
});
