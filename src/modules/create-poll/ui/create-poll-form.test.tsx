import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isFreshPoll } from "@/shared/fresh-poll";
import { CreatePollForm } from "./create-poll-form";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const createPoll = vi.fn();

vi.mock("../server/create-poll-action", () => ({ createPoll: (input: unknown) => createPoll(input) }));

const thursdayMorning = new Date(2026, 9, 15, 9);

function stubShareSheet(share: (data: ShareData) => Promise<void>) {
  Object.defineProperty(navigator, "share", { value: share, configurable: true });
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
  sessionStorage.clear();
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
  it("shows Od and Do of the evening, with no presets", () => {
    render(<CreatePollForm />);

    expect(screen.getByRole("button", { name: "Od 17:00" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Do 23:00" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Wieczór 17–23" })).not.toBeInTheDocument();
    expect(screen.getAllByText("17:00 → 23:00 · 6 godzin")).not.toHaveLength(0);
  });

  it("picks 22:00 to 4:00 in the sheet's two hour columns", async () => {
    render(<CreatePollForm />);

    await userEvent.click(screen.getByRole("button", { name: "Od 17:00" }));
    const sheet = screen.getByRole("dialog", { name: "O której?" });

    await userEvent.click(within(within(sheet).getByRole("group", { name: "Od" })).getByRole("button", { name: "22:00" }));
    await userEvent.click(within(within(sheet).getByRole("group", { name: "Do" })).getByRole("button", { name: "4:00" }));

    expect(within(sheet).getByText("22:00 → 4:00 · 6 godzin")).toBeInTheDocument();
    await userEvent.click(within(sheet).getByRole("button", { name: "Gotowe" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Do 4:00" })).toBeInTheDocument();
  });

  it("opens the sheet on the hour of the field that was tapped", async () => {
    render(<CreatePollForm />);

    await userEvent.click(screen.getByRole("button", { name: "Do 23:00" }));

    expect(within(screen.getByRole("group", { name: "Do" })).getByRole("button", { name: "23:00" })).toHaveFocus();
  });

  it("closes the sheet on Escape and on the scrim, back on the field that opened it", async () => {
    render(<CreatePollForm />);

    await userEvent.click(screen.getByRole("button", { name: "Do 23:00" }));
    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Do 23:00" })).toHaveFocus();
    await userEvent.click(screen.getByRole("button", { name: "Od 17:00" }));
    await userEvent.click(screen.getByTestId("hour-sheet-scrim"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Od 17:00" }));
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Od 17:00" })).toHaveFocus();
  });

  it("picks 22:00 to 4:00 on the hour tiles, start then end", async () => {
    render(<CreatePollForm />);
    const tiles = screen.getByRole("group", { name: "Godziny" });

    await userEvent.click(within(tiles).getByRole("button", { name: "22:00" }));
    expect(screen.getByText("Od 22:00, teraz kliknij koniec")).toBeInTheDocument();

    expect(
      within(tiles)
        .getAllByRole("button", { pressed: true })
        .map((tile) => tile.textContent),
    ).toEqual(["22"]);

    await userEvent.click(within(tiles).getByRole("button", { name: "3:00" }));

    expect(
      within(tiles)
        .getAllByRole("button", { pressed: true })
        .map((tile) => tile.textContent),
    ).toEqual(["22", "23", "0", "1", "2", "3"]);

    expect(screen.getAllByText("22:00 → 4:00 · 6 godzin")).not.toHaveLength(0);
  });

  it("ends on a tile before the start in the next morning", async () => {
    render(<CreatePollForm />);
    const tiles = screen.getByRole("group", { name: "Godziny" });

    await userEvent.click(within(tiles).getByRole("button", { name: "2:00" }));
    await userEvent.click(within(tiles).getByRole("button", { name: "8:00" }));

    expect(
      within(tiles)
        .getAllByRole("button", { pressed: true })
        .map((tile) => tile.textContent),
    ).toEqual(["6", "7", "8", "2", "3", "4", "5"]);

    expect(screen.getAllByText("2:00 → 9:00 · 7 godzin")).not.toHaveLength(0);
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

  it("creates the poll and lands on it marked as fresh, without opening the share sheet", async () => {
    const share = vi.fn(async () => {});

    stubShareSheet(share);
    createPoll.mockResolvedValue({ ok: true, id: "abcdefghij" });
    render(<CreatePollForm />);

    await userEvent.type(screen.getByRole("textbox", { name: "Co robimy?" }), "Kino");
    await userEvent.click(screen.getByRole("button", { name: "Ten weekend" }));
    await userEvent.click(within(screen.getByRole("group", { name: "Godziny" })).getByRole("button", { name: "22:00" }));
    await userEvent.click(within(screen.getByRole("group", { name: "Godziny" })).getByRole("button", { name: "3:00" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Twoje imię" }), "Kuba");
    await userEvent.click(screen.getByRole("button", { name: "Utwórz i wyślij na grupę" }));

    expect(createPoll).toHaveBeenCalledWith({
      title: "Kino",
      dates: ["2026-10-16", "2026-10-17", "2026-10-18"],
      firstHour: 22,
      hourCount: 6,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      organiserName: "Kuba",
    });

    expect(push).toHaveBeenCalledWith("/e/abcdefghij");
    expect(share).not.toHaveBeenCalled();
    expect(isFreshPoll("abcdefghij")).toBe(true);
  });

  it("answers the tap at once with Tworzę ankietę… and creates nothing on a second tap", async () => {
    createPoll.mockReturnValue(new Promise(() => {}));
    render(<CreatePollForm />);
    await fillIn("Jutro");

    fireEvent.click(screen.getByRole("button", { name: "Utwórz i wyślij na grupę" }));

    const pending = screen.getByRole("button", { name: "Tworzę ankietę…" });

    expect(pending).toHaveAttribute("aria-busy", "true");
    fireEvent.click(pending);
    expect(createPoll).toHaveBeenCalledTimes(1);
  });

  it("prefills the name used last on this device", async () => {
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
    createPoll.mockRejectedValueOnce(new Error("database is locked")).mockResolvedValueOnce({ ok: true, id: "abcdefghij" });
    render(<CreatePollForm />);
    await fillIn("Dziś");

    await act(() => userEvent.click(screen.getByRole("button", { name: "Utwórz i wyślij na grupę" })));
    expect(screen.getByText("Coś poszło nie tak. Spróbuj jeszcze raz.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Utwórz i wyślij na grupę" }));

    expect(push).toHaveBeenCalledWith("/e/abcdefghij");
  });

  it("reports a create that throws to the server log", async () => {
    createPoll.mockRejectedValueOnce(new Error("An unexpected response was received from the server."));
    const sendBeacon = vi.spyOn(navigator, "sendBeacon");

    render(<CreatePollForm />);
    await fillIn("Dziś");
    await act(() => userEvent.click(screen.getByRole("button", { name: "Utwórz i wyślij na grupę" })));

    expect(sendBeacon).toHaveBeenCalledExactlyOnceWith("/api/failed-saves", JSON.stringify({ action: "createPoll", errorName: "Error" }));
  });
});
