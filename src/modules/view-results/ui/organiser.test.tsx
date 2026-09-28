import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FinalTime } from "./final-time";
import { OrganiserCard } from "./organiser-card";
import { ResultsBody } from "./results-body";
import { ResultsProvider } from "./results-provider";
import { WhilePollLives } from "./while-poll-lives";
import type { FinalTime as FinalTimeValue, Results } from "../server/results-schema";
import type { Organiser } from "./use-is-organiser";

const saturday = "2030-10-19";
const sunday = "2030-10-20";
const readAt = Date.parse("2030-10-15T18:00:00Z");
const saturdayEvening = { date: saturday, firstHour: 18, lastHour: 20 };

function answer(name: string, cells: [string, number][]) {
  return { name, normalisedName: name.toLocaleLowerCase("pl"), savedAt: readAt, slots: cells.map(([date, hour]) => ({ date, hour })) };
}

const threeAnswers: Results = {
  dates: [saturday, sunday],
  hours: [17, 18, 19, 20],
  readAt,
  respondents: [
    answer("Bartek", [[saturday, 18], [saturday, 19], [saturday, 20], [sunday, 18]]),
    answer("Ola", [[saturday, 17], [saturday, 18], [saturday, 19], [sunday, 19], [sunday, 20]]),
    answer("Michał", [[saturday, 18], [saturday, 19], [saturday, 20], [sunday, 17], [sunday, 18], [sunday, 19], [sunday, 20]]),
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
      <WhilePollLives gone={<h1>Tej ankiety już nie ma</h1>}>
        <FinalTime />
        <OrganiserCard />
        <ResultsBody />
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
  vi.stubGlobal("fetch", vi.fn(async () => Response.json(threeAnswers)));
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
  delete (Element.prototype as Partial<Element>).animate;
});

describe("a participant", () => {
  it("sees no organiser controls", () => {
    renderPage(threeAnswers);

    expect(screen.queryByRole("button", { name: "Przypomnij" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Więcej" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ustal termin" })).not.toBeInTheDocument();
  });

  it("sees the set time with a calendar file, and cannot change it", () => {
    renderPage(withFinal(saturdayEvening));

    const final = screen.getByRole("region", { name: "Ustalone" });
    expect(final).toHaveTextContent("Sobota 19.10, 18:00");
    expect(within(final).getByRole("link", { name: "Dodaj do kalendarza" })).toHaveAttribute("href", "/e/Pl4nszowki/termin.ics");
    expect(within(final).queryByRole("button", { name: "Zmień" })).not.toBeInTheDocument();
  });

  it("sees nothing set while no time is set", () => {
    renderPage(threeAnswers);

    expect(screen.queryByRole("region", { name: "Ustalone" })).not.toBeInTheDocument();
  });
});

describe("the organiser", () => {
  it("sets the best time from Twoja ankieta", async () => {
    const asOrganiser = organiser();
    renderPage(threeAnswers, asOrganiser);

    await userEvent.click(within(screen.getByRole("region", { name: "Twoja ankieta" })).getByRole("button", { name: "Ustal termin" }));

    expect(asOrganiser.setFinal).toHaveBeenCalledExactlyOnceWith({ date: saturday, firstHour: 18, lastHour: 20 });
  });

  it("has no time to set while nobody answered, and still reminds", () => {
    renderPage({ ...threeAnswers, respondents: [] }, organiser());

    expect(screen.queryByRole("button", { name: "Ustal termin" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Przypomnij" })).toBeVisible();
  });

  it("changes a set time, and cannot set another until then", async () => {
    const asOrganiser = organiser();
    renderPage(withFinal(saturdayEvening), asOrganiser);

    expect(screen.queryByRole("button", { name: "Ustal termin" })).not.toBeInTheDocument();
    await userEvent.click(within(screen.getByRole("region", { name: "Ustalone" })).getByRole("button", { name: "Zmień" }));

    expect(asOrganiser.clearFinal).toHaveBeenCalledOnce();
  });

  it("hears why a change failed even where the results are not shown", async () => {
    render(
      <ResultsProvider pollId="Pl4nszowki" initial={withFinal(saturdayEvening)} organiserKey="kuba" organiser={organiser({ clearFinal: vi.fn(async () => Promise.reject(new Error("offline"))) })}>
        <FinalTime />
      </ResultsProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Zmień" }));

    expect(within(screen.getByRole("region", { name: "Ustalone" })).getByRole("alert")).toHaveTextContent(
      "Nie udało się. Sprawdź internet i spróbuj jeszcze raz.",
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
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ reason: "gone" }, { status: 404 })));
    renderPage(threeAnswers, asOrganiser);
    await userEvent.click(screen.getByRole("button", { name: "Więcej" }));

    await userEvent.click(screen.getByRole("button", { name: "Usuń ankietę" }));
    expect(screen.getByRole("dialog", { name: "Usunąć ankietę?" })).toHaveTextContent("Znikną też odpowiedzi 3 osób. Tego nie da się cofnąć.");
    await userEvent.click(screen.getByRole("button", { name: "Nie, zostaw" }));

    expect(asOrganiser.deletePoll).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Więcej" }));
    await userEvent.click(screen.getByRole("button", { name: "Usuń ankietę" }));
    await userEvent.click(screen.getByRole("button", { name: "Tak, usuń" }));

    expect(asOrganiser.deletePoll).toHaveBeenCalledOnce();
    expect(await screen.findByRole("heading", { name: "Tej ankiety już nie ma" })).toBeVisible();
  });

  it("loses the controls once the server says this device is not the organiser", async () => {
    renderPage(threeAnswers, organiser({ setFinal: vi.fn(async () => ({ ok: false as const, reason: "not-organiser" as const })) }));

    await userEvent.click(screen.getByRole("button", { name: "Ustal termin" }));

    expect(screen.queryByRole("button", { name: "Przypomnij" })).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("To urządzenie nie jest już organizatorem tej ankiety.");
  });

  it("fills the chosen hours in sequence once the time is set", async () => {
    const filled: { cell: string | null; delay?: number }[] = [];
    vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    Element.prototype.animate = vi.fn(function (this: Element, _keyframes, options) {
      filled.push({ cell: this.getAttribute("aria-label"), delay: typeof options === "object" ? options.delay : undefined });
      return {} as Animation;
    });
    vi.stubGlobal("fetch", vi.fn(async () => Response.json(withFinal({ date: sunday, firstHour: 19, lastHour: 21 }))));
    renderPage(threeAnswers, organiser());

    await userEvent.click(screen.getByRole("button", { name: "Ustal termin" }));
    await screen.findByRole("region", { name: "Ustalone" });

    expect(filled).toEqual([
      { cell: "nd 20, 19:00, 2 z 3 może", delay: 0 },
      { cell: "nd 20, 20:00, 2 z 3 może", delay: 90 },
    ]);
    expect(screen.getByRole("button", { name: "nd 20, 19:00, 2 z 3 może" })).toHaveAttribute("data-best");
    expect(screen.getByRole("button", { name: "sb 19, 18:00, 3 z 3 może" })).not.toHaveAttribute("data-best");
  });
});

describe("a poll opened with its time already set", () => {
  it("marks the set hours without motion", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    Element.prototype.animate = vi.fn();
    renderPage(withFinal({ date: sunday, firstHour: 19, lastHour: 21 }));

    expect(screen.getByRole("button", { name: "nd 20, 20:00, 2 z 3 może" })).toHaveAttribute("data-best");
    expect(Element.prototype.animate).not.toHaveBeenCalled();
  });
});
