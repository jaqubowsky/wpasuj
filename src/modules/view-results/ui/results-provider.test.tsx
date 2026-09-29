import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BestNow } from "./best-now";
import { PeoplePanel } from "./people-panel";
import { RespondentCount } from "./respondent-count";
import { ResultsBody } from "./results-body";
import { ResultsProvider } from "./results-provider";
import { WhilePollLives } from "./while-poll-lives";
import type { Results } from "../server/results-schema";

const saturday = "2030-10-19";
const sunday = "2030-10-20";
const readAt = Date.parse("2030-10-15T18:00:00Z");
const minutesBefore = (minutes: number) => readAt - minutes * 60_000;

function answer(name: string, savedAt: number, cells: [string, number][]) {
  return { name, normalisedName: name.toLocaleLowerCase("pl"), savedAt, slots: cells.map(([date, hour]) => ({ date, hour })) };
}

const threeAnswers: Results = {
  dates: [saturday, sunday],
  hours: [17, 18, 19, 20],
  readAt,
  respondents: [
    answer("Ola", minutesBefore(120), [
      [saturday, 17],
      [saturday, 18],
      [saturday, 19],
      [sunday, 19],
      [sunday, 20],
    ]),
    answer("Bartek", minutesBefore(20), [
      [saturday, 18],
      [saturday, 19],
      [saturday, 20],
      [sunday, 18],
    ]),
    answer("Kasia", minutesBefore(0), [
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

function Tabs({ results, panel = true }: { results: Results; panel?: boolean }) {
  return (
    <ResultsProvider pollId="Pl4nszowki" initial={results} organiserKey="ola">
      <RespondentCount />
      <WhilePollLives gone={<h1>Tej ankiety już nie ma</h1>}>
        {panel && <BestNow />}
        {panel && <PeoplePanel />}
        <ResultsBody />
      </WhilePollLives>
    </ResultsProvider>
  );
}

function renderResults(results: Results) {
  return render(<Tabs results={results} />);
}

const answered = () =>
  within(screen.getByRole("list", { name: "Odpowiedzieli" }))
    .getAllByRole("listitem")
    .map((row) => row.textContent);

describe("Results", () => {
  it("shows only the best time, never who cannot make it", () => {
    renderResults({ ...threeAnswers, respondents: [...threeAnswers.respondents, answer("Zosia", minutesBefore(5), [])] });

    expect(screen.getByRole("region", { name: "Najlepiej teraz" })).toHaveTextContent(/^Najlepiej terazSobota 19\.10, 18–20$/);
  });

  it("counts who can in every hour and marks neither the best time nor where everyone can", () => {
    renderResults(threeAnswers);

    expect(screen.getByRole("button", { name: "sb 19, 18:00, 3 z 3 może" })).toHaveTextContent("3");
    expect(screen.getByRole("button", { name: "sb 19, 18:00, 3 z 3 może" })).toHaveAttribute("data-heat", "5");
    expect(screen.getByRole("button", { name: "sb 19, 18:00, 3 z 3 może" })).not.toHaveAttribute("data-everyone");
    expect(screen.getByRole("button", { name: "sb 19, 18:00, 3 z 3 może" })).not.toHaveAttribute("data-best");
    expect(screen.getByRole("button", { name: "nd 20, 18:00, 2 z 3 może" })).toHaveAttribute("data-heat", "4");
    expect(screen.getByRole("button", { name: "sb 19, 17:00, 1 z 3 może" })).toHaveAttribute("data-heat", "2");
  });

  it("rings a tapped hour and shows who can and who can't in a sheet, and closes again", async () => {
    renderResults(threeAnswers);

    await userEvent.click(screen.getByRole("button", { name: "nd 20, 18:00, 2 z 3 może" }));

    const details = screen.getByRole("dialog", { name: "Niedziela 20.10, 18:00" });

    expect(screen.getByRole("button", { name: "nd 20, 18:00, 2 z 3 może" })).toHaveAttribute("data-selected");

    expect(
      within(within(details).getByRole("list", { name: "Może" }))
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["KKasia", "BBartek"]);

    expect(
      within(within(details).getByRole("list", { name: "Nie może" }))
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["OOla, organizator, nie może"]);

    fireEvent.click(details);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("lists who answered, newest first, marking who can't make any hour, the organiser and you", () => {
    renderResults({ ...threeAnswers, you: "bartek", respondents: [...threeAnswers.respondents, answer("Zosia", minutesBefore(5), [])] });

    expect(answered()).toEqual(["KKasia", "ZZosia, nie może", "BBartek, to Ty", "OOla, organizator"]);
  });

  it("opens who answered from the counter, grouped by who marked hours", async () => {
    renderResults({ ...threeAnswers, respondents: [...threeAnswers.respondents, answer("Zosia", minutesBefore(5), [])] });

    await userEvent.click(screen.getByRole("button", { name: "4 osoby" }));

    const sheet = screen.getByRole("dialog", { name: "Odpowiedzieli" });

    expect(within(within(sheet).getByRole("list", { name: "Zaznaczyli godziny" })).getAllByRole("listitem")).toHaveLength(3);

    expect(
      within(within(sheet).getByRole("list", { name: "Nie może w żadnym" }))
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["ZZosia, nie może"]);
  });

  it("keeps a respondent's tint through a case-only rename", async () => {
    const tintsOf = async (name: string) => {
      const { unmount } = renderResults({ ...threeAnswers, respondents: [{ ...threeAnswers.respondents[0], name }] });
      const listed = within(screen.getByRole("list", { name: "Odpowiedzieli" })).getByRole("img", { name });

      await userEvent.click(screen.getByRole("button", { name: "sb 19, 17:00, 1 z 1 może" }));
      const free = within(within(screen.getByRole("dialog")).getByRole("list", { name: "Może" })).getByRole("img", { name });
      const tints = [listed.dataset.tint, free.dataset.tint];

      unmount();

      return tints;
    };

    expect(await tintsOf("ola")).toEqual(await tintsOf("Ola"));
  });

  it("asks to send the link while nobody answered", () => {
    renderResults({ ...threeAnswers, respondents: [] });

    expect(screen.getByText("Nikt jeszcze nie odpowiedział. Wyślij link na grupę.")).toBeVisible();
    expect(screen.getByText("Bądź pierwszy")).toBeVisible();
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Najlepiej teraz" })).not.toBeInTheDocument();
  });
});

describe("Results refreshing", () => {
  const withZosia = { ...threeAnswers, respondents: [...threeAnswers.respondents, answer("Zosia", minutesBefore(0), [])] };

  function answerWith(...responses: Response[]) {
    const fetch = vi.fn(async () => responses.shift() ?? Response.json(withZosia));

    vi.stubGlobal("fetch", fetch);

    return fetch;
  }

  async function wait(ms: number) {
    await act(() => vi.advanceTimersByTimeAsync(ms));
  }

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("shows another answer within 10 seconds, the request included", async () => {
    vi.useFakeTimers();
    answerWith(Response.json(withZosia));
    renderResults(threeAnswers);

    await wait(9_000);

    expect(answered()).toHaveLength(4);
  });

  it("keeps refreshed answers when the panel mounts again", async () => {
    vi.useFakeTimers();
    const fetch = answerWith(Response.json(withZosia));
    const { rerender } = renderResults(threeAnswers);

    await wait(9_000);

    rerender(<Tabs results={threeAnswers} panel={false} />);
    rerender(<Tabs results={threeAnswers} />);

    expect(answered()).toHaveLength(4);
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("asks at once when the window regains focus", async () => {
    vi.useFakeTimers();
    const fetch = answerWith(Response.json(withZosia));

    renderResults(threeAnswers);

    fireEvent.focus(window);
    await wait(0);

    expect(fetch).toHaveBeenCalledOnce();
    expect(answered()).toHaveLength(4);
  });

  it("says the poll is gone once the read answers 404, and stops asking", async () => {
    vi.useFakeTimers();
    const fetch = answerWith(Response.json({ reason: "gone" }, { status: 404 }));

    renderResults(threeAnswers);

    await wait(60_000);

    expect(screen.getByRole("heading", { name: "Tej ankiety już nie ma" })).toBeVisible();
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("says a refresh failed until the next one succeeds", async () => {
    vi.useFakeTimers();
    answerWith(new Response(null, { status: 500 }), Response.json(withZosia));
    renderResults(threeAnswers);

    await wait(9_000);

    expect(screen.getByText("Nie udało się odświeżyć. Spróbujemy za chwilę.")).toBeVisible();
    expect(answered()).toHaveLength(3);

    await wait(9_000);

    expect(screen.queryByText("Nie udało się odświeżyć. Spróbujemy za chwilę.")).not.toBeInTheDocument();
    expect(answered()).toHaveLength(4);
  });
});
