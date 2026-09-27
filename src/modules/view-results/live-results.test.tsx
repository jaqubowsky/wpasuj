import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LiveResults } from "./live-results";
import type { Results } from "./results-schema";

const saturday = "2030-10-19";
const sunday = "2030-10-20";
const readAt = Date.parse("2030-10-15T18:00:00Z");
const minutesBefore = (minutes: number) => readAt - minutes * 60_000;

function answer(name: string, savedAt: number, cells: [string, number][]) {
  return { name, savedAt, slots: cells.map(([date, hour]) => ({ date, hour })) };
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

function renderResults(results: Results) {
  render(<LiveResults pollId="Pl4nszowki" initial={results} />);
}

describe("LiveResults", () => {
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

  it("asks to send the link while nobody answered", () => {
    renderResults({ ...threeAnswers, respondents: [] });

    expect(screen.getByText("Nikt jeszcze nie odpowiedział. Wyślij link na grupę.")).toBeVisible();
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });
});
