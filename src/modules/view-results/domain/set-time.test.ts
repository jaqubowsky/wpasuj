import { describe, expect, it } from "vitest";
import { setTimeMessage, whoComes } from "./set-time";

const saturday = "2030-10-19";
const saturdayEvening = { date: saturday, firstHour: 19, lastHour: 21 };

function answer(name: string, slots: [string, number][]) {
  return { name, slots: slots.map(([date, hour]) => ({ date, hour })) };
}

describe("whoComes", () => {
  it("lets in only those free for every hour of the set range", () => {
    const ola = answer("Ola", [[saturday, 19], [saturday, 20]]);
    const bartek = answer("Bartek", [[saturday, 19]]);
    const michal = answer("Michał", [[saturday, 18], [saturday, 19], [saturday, 20], [saturday, 21]]);
    const zuza = answer("Zuza", []);
    const kasia = answer("Kasia", [["2030-10-20", 19], ["2030-10-20", 20]]);

    const { coming, cannot } = whoComes([ola, bartek, michal, zuza, kasia], saturdayEvening);

    expect(coming).toEqual([ola, michal]);
    expect(cannot).toEqual([bartek, zuza, kasia]);
  });

  it("counts the hours past midnight under the evening's date", () => {
    const ola = answer("Ola", [[saturday, 23], [saturday, 24]]);
    const bartek = answer("Bartek", [[saturday, 23], ["2030-10-20", 0]]);

    const { coming } = whoComes([ola, bartek], { date: saturday, firstHour: 23, lastHour: 25 });

    expect(coming).toEqual([ola]);
  });
});

describe("setTimeMessage", () => {
  it("tells the group the title, the time and the link", () => {
    expect(setTimeMessage(saturdayEvening, { title: "Planszówki u Michała", link: "https://wpasuj.pl/e/Pl4nszowki" })).toBe(
      "Planszówki u Michała: Sobota 19 października, 19:00–21:00. https://wpasuj.pl/e/Pl4nszowki",
    );
  });
});
