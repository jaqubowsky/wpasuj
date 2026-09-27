import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResultsBody } from "./results-body";
import { ResultsLead } from "./results-lead";
import { ResultsProvider } from "./results-provider";
import type { Results } from "./results-schema";

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
    answer("Ola", minutesBefore(120), [[saturday, 17], [saturday, 18], [saturday, 19], [sunday, 19], [sunday, 20]]),
    answer("Bartek", minutesBefore(20), [[saturday, 18], [saturday, 19], [saturday, 20], [sunday, 18]]),
    answer("Kasia", minutesBefore(0), [[saturday, 18], [saturday, 19], [saturday, 20], [sunday, 17], [sunday, 18], [sunday, 19], [sunday, 20]]),
  ],
};

function Tabs({ results, lead = true }: { results: Results; lead?: boolean }) {
  return (
    <ResultsProvider pollId="Pl4nszowki" initial={results}>
      <div data-testid="lead">{lead && <ResultsLead />}</div>
      <div data-testid="body">
        <ResultsBody />
      </div>
    </ResultsProvider>
  );
}

function renderResults(results: Results) {
  return render(<Tabs results={results} />);
}

describe("Results", () => {
  it("puts the best time in the lead and the heatmap with who answered in the body", () => {
    renderResults(threeAnswers);

    expect(within(screen.getByTestId("lead")).getByRole("region", { name: "Najlepiej" })).toBeVisible();
    expect(within(screen.getByTestId("lead")).getByRole("list", { name: "Też dobre" })).toBeVisible();
    expect(within(screen.getByTestId("body")).getByRole("grid")).toBeVisible();
    expect(within(screen.getByTestId("body")).getByRole("list", { name: "Kto odpowiedział" })).toBeVisible();
  });

  it("leads with the best time and offers two other good ones", () => {
    renderResults(threeAnswers);

    const best = screen.getByRole("region", { name: "Najlepiej" });
    expect(best).toHaveTextContent("Sobota 19.10, 18–20");
    expect(best).toHaveTextContent("3 z 3 może");
    expect(best).not.toHaveTextContent("Nie może");
    const others = within(screen.getByRole("list", { name: "Też dobre" })).getAllByRole("listitem");
    expect(others.map((item) => item.textContent)).toEqual(["nd 20.10, 19–212 z 3", "sb 19.10, 20–212 z 3"]);
  });

  it("names who can't make the best time", () => {
    renderResults({ ...threeAnswers, respondents: [...threeAnswers.respondents, answer("Zosia", minutesBefore(5), [])] });

    const best = screen.getByRole("region", { name: "Najlepiej" });
    expect(best).toHaveTextContent("3 z 4 może");
    expect(best).toHaveTextContent("Nie może: Zosia");
  });

  it("counts who can in every hour and marks where everyone can", () => {
    renderResults(threeAnswers);

    expect(screen.getByRole("button", { name: "sb 19, 18:00, 3 z 3 może" })).toHaveTextContent("3");
    expect(screen.getByRole("button", { name: "sb 19, 18:00, 3 z 3 może" })).toHaveAttribute("data-everyone");
    expect(screen.getByRole("button", { name: "sb 19, 18:00, 3 z 3 może" })).toHaveAttribute("data-best");
    expect(screen.getByRole("button", { name: "nd 20, 18:00, 2 z 3 może" })).toHaveAttribute("data-heat", "4");
    expect(screen.getByRole("button", { name: "sb 19, 17:00, 1 z 3 może" })).toHaveAttribute("data-heat", "2");
    expect(screen.getByRole("button", { name: "sb 19, 17:00, 1 z 3 może" })).not.toHaveAttribute("data-everyone");
  });

  it("shows who can and who can't for a tapped hour, and closes again", async () => {
    renderResults(threeAnswers);

    await userEvent.click(screen.getByRole("button", { name: "nd 20, 18:00, 2 z 3 może" }));

    const details = screen.getByRole("region", { name: "Niedziela 20.10, 18:00" });
    expect(within(within(details).getByRole("list", { name: "Mogą" })).getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "BBartek",
      "KKasia",
    ]);
    expect(within(within(details).getByRole("list", { name: "Nie mogą" })).getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "OOla",
    ]);
    await userEvent.click(within(details).getByRole("button", { name: "Zamknij" }));
    expect(screen.queryByRole("region", { name: "Niedziela 20.10, 18:00" })).not.toBeInTheDocument();
  });

  it("lists who answered, newest first, and who can't make any hour", () => {
    renderResults({ ...threeAnswers, respondents: [...threeAnswers.respondents, answer("Zosia", minutesBefore(5), [])] });

    const rows = within(screen.getByRole("list", { name: "Kto odpowiedział" })).getAllByRole("listitem");
    expect(rows.map((row) => row.textContent)).toEqual([
      "KKasiaprzed chwilą",
      "ZZosianie może",
      "BBartek20 min temu",
      "OOla2 godz. temu",
    ]);
  });

  it("keeps a respondent's tint through a case-only rename", async () => {
    const tintsOf = async (name: string) => {
      const { unmount } = renderResults({ ...threeAnswers, respondents: [{ ...threeAnswers.respondents[0], name }] });
      const listed = within(screen.getByRole("list", { name: "Kto odpowiedział" })).getByRole("img", { name });
      await userEvent.click(screen.getByRole("button", { name: "sb 19, 17:00, 1 z 1 może" }));
      const free = within(screen.getByRole("list", { name: "Mogą" })).getByRole("img", { name });
      const tints = [listed.dataset.tint, free.dataset.tint];
      unmount();
      return tints;
    };

    expect(await tintsOf("ola")).toEqual(await tintsOf("Ola"));
  });

  it("asks to send the link while nobody answered", () => {
    renderResults({ ...threeAnswers, respondents: [] });

    expect(screen.getByText("Nikt jeszcze nie odpowiedział. Wyślij link na grupę.")).toBeVisible();
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
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

    expect(screen.getByRole("region", { name: "Najlepiej" })).toHaveTextContent("3 z 4 może");
  });

  it("keeps refreshed answers when the lead mounts again", async () => {
    vi.useFakeTimers();
    const fetch = answerWith(Response.json(withZosia));
    const { rerender } = renderResults(threeAnswers);
    await wait(9_000);

    rerender(<Tabs results={threeAnswers} lead={false} />);
    rerender(<Tabs results={threeAnswers} />);

    expect(screen.getByRole("region", { name: "Najlepiej" })).toHaveTextContent("3 z 4 może");
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("asks at once when the window regains focus", async () => {
    vi.useFakeTimers();
    const fetch = answerWith(Response.json(withZosia));
    renderResults(threeAnswers);

    fireEvent.focus(window);
    await wait(0);

    expect(fetch).toHaveBeenCalledOnce();
    expect(screen.getByRole("region", { name: "Najlepiej" })).toHaveTextContent("3 z 4 może");
  });

  it("says the poll is gone once the read answers 404, and stops asking", async () => {
    vi.useFakeTimers();
    const fetch = answerWith(Response.json({ reason: "gone" }, { status: 404 }));
    renderResults(threeAnswers);

    await wait(60_000);

    expect(screen.getByRole("heading", { name: "Tej ankiety już nie ma" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Zrób nową ankietę" })).toHaveAttribute("href", "/");
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("says a refresh failed until the next one succeeds", async () => {
    vi.useFakeTimers();
    answerWith(new Response(null, { status: 500 }), Response.json(withZosia));
    renderResults(threeAnswers);

    await wait(9_000);

    expect(screen.getByText("Nie udało się odświeżyć. Spróbujemy za chwilę.")).toBeVisible();
    expect(screen.getByRole("region", { name: "Najlepiej" })).toHaveTextContent("3 z 3 może");

    await wait(9_000);

    expect(screen.queryByText("Nie udało się odświeżyć. Spróbujemy za chwilę.")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Najlepiej" })).toHaveTextContent("3 z 4 może");
  });
});
