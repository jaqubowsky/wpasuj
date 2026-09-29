import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Invitation } from "./invitation";
import { SetBadge, SettledPoster } from "./set-time";
import { OrganiserCard } from "./organiser-card";
import { ResultsBody } from "./results-body";
import { ResultsProvider } from "./results-provider";
import { UntilSet } from "./until-set";
import { WhilePollLives } from "./while-poll-lives";
import type { FinalTime as FinalTimeValue, Results } from "../server/results-schema";
import type { Organiser } from "./use-is-organiser";

const saturday = "2030-10-19";
const sunday = "2030-10-20";
const readAt = Date.parse("2030-10-15T18:00:00Z");
const saturdayEvening = { date: saturday, firstHour: 18, lastHour: 20 };
const sundayEvening = { date: sunday, firstHour: 19, lastHour: 21 };

function answer(name: string, cells: [string, number][]) {
  return { name, normalisedName: name.toLocaleLowerCase("pl"), savedAt: readAt, slots: cells.map(([date, hour]) => ({ date, hour })) };
}

const threeAnswers: Results = {
  dates: [saturday, sunday],
  hours: [17, 18, 19, 20],
  readAt,
  respondents: [
    answer("Bartek", [
      [saturday, 18],
      [saturday, 19],
      [saturday, 20],
      [sunday, 18],
    ]),
    answer("Ola", [
      [saturday, 17],
      [saturday, 18],
      [saturday, 19],
      [sunday, 19],
      [sunday, 20],
    ]),
    answer("Michał", [
      [saturday, 18],
      [saturday, 19],
      [saturday, 20],
      [sunday, 17],
      [sunday, 18],
      [sunday, 19],
      [sunday, 20],
    ]),
  ],
  final: null,
};

function organiser(overrides: Partial<Organiser> = {}): Organiser {
  return {
    title: "Planszówki",
    token: "organiser-token",
    setFinal: vi.fn(async () => ({ ok: true as const })),
    clearFinal: vi.fn(async () => ({ ok: true as const })),
    deletePoll: vi.fn(async () => ({ ok: true as const })),
    ...overrides,
  };
}

function renderPage(results: Results, asOrganiser?: Organiser) {
  return render(
    <ResultsProvider pollId="Pl4nszowki" initial={results} organiser={asOrganiser} organiserKey="kuba">
      <UntilSet invitation={<SetBadge />}>{null}</UntilSet>
      <UntilSet invitation={<SettledPoster eyebrow="Planszówki" setBy="Ustalone przez: Kuba" />}>{null}</UntilSet>
      <WhilePollLives gone={<h1>Tej ankiety już nie ma</h1>}>
        <UntilSet invitation={<Invitation title="Planszówki" timeZone="Europe/Warsaw" />}>
          <OrganiserCard />
          <ResultsBody />
        </UntilSet>
      </WhilePollLives>
    </ResultsProvider>,
  );
}

function withFinal(final: FinalTimeValue): Results {
  return { ...threeAnswers, final };
}

let clipboard: string | undefined;

beforeEach(() => {
  clipboard = undefined;

  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json(threeAnswers)),
  );

  Object.defineProperty(navigator, "share", { configurable: true, value: undefined });

  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async (text: string) => {
        clipboard = text;
      },
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("a participant", () => {
  it("sees no organiser controls", () => {
    renderPage(threeAnswers);

    expect(screen.queryByRole("button", { name: "Przypomnij" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Więcej" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ustal termin" })).not.toBeInTheDocument();
  });

  it("sees the set day and hours with a way to the calendar, and nothing to change or paint", () => {
    renderPage(withFinal(saturdayEvening));

    const setTime = screen.getByRole("region", { name: "Termin" });

    expect(setTime).toHaveTextContent("Widzimy się");
    expect(setTime).toHaveTextContent("Sobota");
    expect(setTime).toHaveTextContent("19 października");
    expect(setTime).toHaveTextContent("18:00–20:00");
    expect(setTime).toHaveTextContent("Ustalone przez: Kuba");
    expect(screen.getByRole("button", { name: "Dodaj do kalendarza" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Zmień termin" })).not.toBeInTheDocument();
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("picks Google, Apple or Outlook from Dodaj do kalendarza, each with the set time", async () => {
    renderPage(withFinal(saturdayEvening));

    await userEvent.click(screen.getByRole("button", { name: "Dodaj do kalendarza" }));

    const menu = screen.getByRole("dialog", { name: "Dodaj do kalendarza" });
    const google = new URL(within(menu).getByRole("link", { name: "Kalendarz Google" }).getAttribute("href")!);

    expect(google.hostname).toBe("calendar.google.com");
    expect(google.searchParams.get("text")).toBe("Planszówki");
    expect(google.searchParams.get("dates")).toBe("20301019T160000Z/20301019T180000Z");
    expect(google.searchParams.get("details")).toBe(`${location.origin}/e/Pl4nszowki`);
    const apple = within(menu).getByRole("link", { name: "Kalendarz Apple" });

    expect(apple).toHaveAttribute("href", "/e/Pl4nszowki/termin.ics");
    expect(apple).not.toHaveAttribute("download");
    const outlook = new URL(within(menu).getByRole("link", { name: "Outlook" }).getAttribute("href")!);

    expect(outlook.hostname).toBe("outlook.live.com");
    expect(outlook.searchParams.get("startdt")).toBe("2030-10-19T16:00:00Z");
    expect(within(menu).getByRole("link", { name: "Kalendarz Google" })).toHaveAttribute("target", "_blank");
    expect(within(menu).getByRole("link", { name: "Outlook" })).toHaveAttribute("target", "_blank");
  });

  it("sees who comes and who cannot", () => {
    renderPage(withFinal(sundayEvening));

    const people = screen.getByRole("region", { name: "Kto będzie" });

    const coming = within(within(people).getByRole("list", { name: "Będzie" }))
      .getAllByRole("img")
      .map((avatar) => avatar.getAttribute("aria-label"));

    expect(people).toHaveTextContent("Będą 2 osoby");
    expect(coming).toEqual(["Ola", "Michał"]);
    expect(people).toHaveTextContent("Bartek nie może.");
  });

  it("sends the set time to the group", async () => {
    renderPage(withFinal(saturdayEvening));

    await userEvent.click(screen.getByRole("button", { name: "Wyślij termin na grupę" }));

    expect(clipboard).toBe(`Planszówki: Sobota 19 października, 18:00–20:00. ${location.origin}/e/Pl4nszowki`);
    expect(screen.getByRole("status")).toHaveTextContent("Wiadomość skopiowana. Wklej ją na grupę.");
  });

  it("sees every vote read-only, the set hours unmarked", async () => {
    renderPage(withFinal(sundayEvening));

    await userEvent.click(screen.getByRole("button", { name: "Zobacz wszystkie głosy" }));

    const votes = screen.getByRole("dialog", { name: "Wszystkie głosy" });
    const heatmap = within(votes).getByRole("grid", { name: "Kto może" });

    expect(heatmap).not.toHaveAttribute("aria-multiselectable");
    expect(within(heatmap).getByRole("button", { name: "nd 20, 20:00, 2 z 3 może" })).not.toHaveAttribute("data-best");
  });

  it("finds no hour left open from the votes once the time is cleared", async () => {
    renderPage(withFinal(sundayEvening));
    await userEvent.click(screen.getByRole("button", { name: "Zobacz wszystkie głosy" }));
    await userEvent.click(screen.getByRole("button", { name: "nd 20, 20:00, 2 z 3 może" }));
    (screen.getByRole("dialog", { name: "Wszystkie głosy" }) as HTMLDialogElement).close();

    window.dispatchEvent(new Event("focus"));

    expect(await screen.findByRole("grid", { name: "Kto może" })).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("sees the open poll again once the time is cleared", async () => {
    renderPage(withFinal(saturdayEvening));

    window.dispatchEvent(new Event("focus"));

    expect(await screen.findByRole("grid", { name: "Kto może" })).toBeVisible();
    expect(screen.queryByRole("region", { name: "Termin" })).not.toBeInTheDocument();
  });
});

describe("the organiser", () => {
  it("sets the best time from Twoja ankieta", async () => {
    const asOrganiser = organiser();

    renderPage(threeAnswers, asOrganiser);

    await userEvent.click(within(screen.getByRole("region", { name: "Twoja ankieta" })).getByRole("button", { name: "Ustal termin" }));

    expect(asOrganiser.setFinal).toHaveBeenCalledExactlyOnceWith({ date: saturday, firstHour: 18, lastHour: 20 });
  });

  it("waits on a slow set with the button held, so a second tap sends nothing", async () => {
    const asOrganiser = organiser({ setFinal: vi.fn(() => new Promise<never>(() => {})) });

    renderPage(threeAnswers, asOrganiser);
    const set = within(screen.getByRole("region", { name: "Twoja ankieta" })).getByRole("button", { name: "Ustal termin" });

    await userEvent.click(set);
    await userEvent.click(set);

    expect(set).toBeDisabled();
    expect(asOrganiser.setFinal).toHaveBeenCalledOnce();
  });

  it("waits on a slow delete with Tak, usuń held", async () => {
    const asOrganiser = organiser({ deletePoll: vi.fn(() => new Promise<never>(() => {})) });

    renderPage(threeAnswers, asOrganiser);
    await userEvent.click(screen.getByRole("button", { name: "Więcej" }));
    await userEvent.click(screen.getByRole("button", { name: "Usuń ankietę" }));
    const confirm = screen.getByRole("button", { name: "Tak, usuń" });

    await userEvent.click(confirm);
    await userEvent.click(confirm);

    expect(confirm).toBeDisabled();
    expect(asOrganiser.deletePoll).toHaveBeenCalledOnce();
  });

  it("has no time to set while nobody answered, and still reminds", () => {
    renderPage({ ...threeAnswers, respondents: [] }, organiser());

    expect(screen.queryByRole("button", { name: "Ustal termin" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Przypomnij" })).toBeVisible();
  });

  it("changes a set time from Twoja ankieta, with no reminder while it is set", async () => {
    const asOrganiser = organiser();

    renderPage(withFinal(saturdayEvening), asOrganiser);

    const card = screen.getByRole("region", { name: "Twoja ankieta" });

    expect(within(card).queryByRole("button", { name: "Ustal termin" })).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: "Przypomnij" })).not.toBeInTheDocument();
    await userEvent.click(within(card).getByRole("button", { name: "Zmień termin" }));

    expect(asOrganiser.clearFinal).toHaveBeenCalledOnce();
  });

  it("reaches the send action before the calendar, in the order it sees them", () => {
    renderPage(withFinal(saturdayEvening), organiser());

    const actions = screen.getAllByRole("button", { name: /^(Wyślij termin na grupę|Dodaj do kalendarza)$/ });

    expect(actions.map((action) => action.textContent)).toEqual(["Wyślij termin na grupę", "Dodaj do kalendarza"]);
  });

  it("hears why a change failed", async () => {
    renderPage(withFinal(saturdayEvening), organiser({ clearFinal: vi.fn(async () => Promise.reject(new Error("offline"))) }));

    await userEvent.click(screen.getByRole("button", { name: "Zmień termin" }));

    expect(within(screen.getByRole("region", { name: "Twoja ankieta" })).getByRole("alert")).toHaveTextContent(
      "Nie udało się. Sprawdź internet i spróbuj jeszcze raz.",
    );
  });

  it("reports a change that throws to the server log with the action it tried", async () => {
    const sendBeacon = vi.spyOn(navigator, "sendBeacon");

    renderPage(withFinal(saturdayEvening), organiser({ clearFinal: vi.fn(async () => Promise.reject(new TypeError("Load failed"))) }));
    await userEvent.click(screen.getByRole("button", { name: "Zmień termin" }));

    expect(sendBeacon).toHaveBeenCalledExactlyOnceWith(
      "/api/failed-saves",
      JSON.stringify({ action: "clearFinal", errorName: "TypeError" }),
    );
  });

  it("reminds with a message naming who answered", async () => {
    renderPage(threeAnswers, organiser());

    await userEvent.click(screen.getByRole("button", { name: "Przypomnij" }));

    expect(clipboard).toBe(`Już są: Bartek, Ola i Michał. Reszta, kiedy możecie? Planszówki ${location.origin}/e/Pl4nszowki`);
    expect(screen.getByRole("status")).toHaveTextContent("Wiadomość skopiowana. Wklej ją na grupę.");
  });

  it("copies the poll link and the private organiser link from Więcej", async () => {
    renderPage(threeAnswers, organiser());

    await userEvent.click(screen.getByRole("button", { name: "Więcej" }));
    await userEvent.click(within(screen.getByRole("dialog", { name: "Więcej" })).getByRole("button", { name: "Kopiuj link do ankiety" }));

    expect(clipboard).toBe(`${location.origin}/e/Pl4nszowki`);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Więcej" }));
    await userEvent.click(screen.getByRole("button", { name: "Link organizatora na inny telefon" }));

    expect(clipboard).toBe(`${location.origin}/e/Pl4nszowki/organizator/organiser-token`);
    expect(screen.getByText(/Nie wysyłaj go na grupę/)).toBeVisible();
  });

  it("deletes the poll only after confirming, and then shows it gone", async () => {
    const asOrganiser = organiser();

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ reason: "gone" }, { status: 404 })),
    );

    renderPage(threeAnswers, asOrganiser);
    await userEvent.click(screen.getByRole("button", { name: "Więcej" }));

    await userEvent.click(screen.getByRole("button", { name: "Usuń ankietę" }));

    expect(screen.getByRole("dialog", { name: "Usunąć ankietę?" })).toHaveTextContent(
      "Znikną też odpowiedzi 3 osób. Tego nie da się cofnąć.",
    );

    await userEvent.click(screen.getByRole("button", { name: "Nie, zostaw" }));

    expect(asOrganiser.deletePoll).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Więcej" }));
    await userEvent.click(screen.getByRole("button", { name: "Usuń ankietę" }));
    await userEvent.click(screen.getByRole("button", { name: "Tak, usuń" }));

    expect(asOrganiser.deletePoll).toHaveBeenCalledOnce();
    expect(await screen.findByRole("heading", { name: "Tej ankiety już nie ma" })).toBeVisible();
  });

  it("drops the Ustalone badge once a set poll is deleted", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ reason: "gone" }, { status: 404 })),
    );

    renderPage(withFinal(saturdayEvening), organiser());
    expect(screen.getByText("Ustalone")).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Więcej" }));
    await userEvent.click(screen.getByRole("button", { name: "Usuń ankietę" }));
    await userEvent.click(screen.getByRole("button", { name: "Tak, usuń" }));

    expect(await screen.findByRole("heading", { name: "Tej ankiety już nie ma" })).toBeVisible();
    expect(screen.queryByText("Ustalone")).not.toBeInTheDocument();
  });

  it("loses the controls once the server says this device is not the organiser", async () => {
    renderPage(threeAnswers, organiser({ setFinal: vi.fn(async () => ({ ok: false as const, reason: "not-organiser" as const })) }));

    await userEvent.click(screen.getByRole("button", { name: "Ustal termin" }));

    expect(screen.queryByRole("button", { name: "Przypomnij" })).not.toBeInTheDocument();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "To urządzenie nie jest już organizatorem tej ankiety. Otwórz na nim link organizatora.",
    );
  });

  it("leads with the invitation once the time is set", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(withFinal(sundayEvening))),
    );

    renderPage(threeAnswers, organiser());

    await userEvent.click(screen.getByRole("button", { name: "Ustal termin" }));

    expect(await screen.findByRole("region", { name: "Termin" })).toHaveTextContent("19:00–21:00");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });
});
