import { describe, expect, it } from "vitest";
import { bestTimes, cannotMake, runsOf } from "./best-time";

const saturday = "2030-10-19";
const sunday = "2030-10-20";
const hours = [17, 18, 19, 20];

function answer(name: string, slots: [string, number][]) {
  return { name, slots: slots.map(([date, hour]) => ({ date, hour })) };
}

describe("runsOf", () => {
  it("joins consecutive hours where the same people are free", () => {
    const runs = runsOf([saturday], hours, [
      answer("Ola", [[saturday, 18], [saturday, 19], [saturday, 20]]),
      answer("Bartek", [[saturday, 18], [saturday, 19], [saturday, 20]]),
    ]);

    expect(runs).toEqual([{ date: saturday, firstHour: 18, lastHour: 21, free: ["Ola", "Bartek"] }]);
  });

  it("keeps 23:00 to 1:00 one run across midnight", () => {
    const runs = runsOf([saturday], [22, 23, 24, 25], [answer("Ola", [[saturday, 23], [saturday, 24]])]);

    expect(runs).toEqual([{ date: saturday, firstHour: 23, lastHour: 25, free: ["Ola"] }]);
  });

  it("splits a run where the free set changes while the count stays the same", () => {
    const runs = runsOf([saturday], hours, [
      answer("Ola", [[saturday, 18], [saturday, 19]]),
      answer("Bartek", [[saturday, 17], [saturday, 18]]),
      answer("Kasia", [[saturday, 19]]),
    ]);

    expect(runs).toEqual([
      { date: saturday, firstHour: 17, lastHour: 18, free: ["Bartek"] },
      { date: saturday, firstHour: 18, lastHour: 19, free: ["Ola", "Bartek"] },
      { date: saturday, firstHour: 19, lastHour: 20, free: ["Ola", "Kasia"] },
    ]);
  });

  it("never runs across two dates or through an hour nobody can make", () => {
    const runs = runsOf([saturday, sunday], hours, [
      answer("Ola", [[saturday, 17], [saturday, 19], [saturday, 20], [sunday, 17]]),
    ]);

    expect(runs).toEqual([
      { date: saturday, firstHour: 17, lastHour: 18, free: ["Ola"] },
      { date: saturday, firstHour: 19, lastHour: 21, free: ["Ola"] },
      { date: sunday, firstHour: 17, lastHour: 18, free: ["Ola"] },
    ]);
  });
});

describe("bestTimes", () => {
  it("ranks by how many can, then by length, then by the earliest start", () => {
    const times = bestTimes([saturday, sunday], hours, [
      answer("Ola", [[saturday, 17], [saturday, 18], [saturday, 19], [sunday, 19], [sunday, 20]]),
      answer("Bartek", [[saturday, 18], [saturday, 19], [saturday, 20], [sunday, 18]]),
      answer("Kasia", [[saturday, 18], [saturday, 19], [saturday, 20], [sunday, 17], [sunday, 18], [sunday, 19], [sunday, 20]]),
    ]);

    expect(times).toEqual([
      { date: saturday, firstHour: 18, lastHour: 20, free: ["Ola", "Bartek", "Kasia"] },
      { date: sunday, firstHour: 19, lastHour: 21, free: ["Ola", "Kasia"] },
      { date: saturday, firstHour: 20, lastHour: 21, free: ["Bartek", "Kasia"] },
    ]);
  });

  it("offers the best time and at most two others that do not overlap it", () => {
    const times = bestTimes([saturday], hours, [
      answer("Ola", [[saturday, 17], [saturday, 18], [saturday, 19], [saturday, 20]]),
      answer("Bartek", [[saturday, 18], [saturday, 19], [saturday, 20]]),
      answer("Kasia", [[saturday, 19], [saturday, 20]]),
    ]);

    expect(times).toEqual([
      { date: saturday, firstHour: 19, lastHour: 21, free: ["Ola", "Bartek", "Kasia"] },
      { date: saturday, firstHour: 18, lastHour: 19, free: ["Ola", "Bartek"] },
      { date: saturday, firstHour: 17, lastHour: 18, free: ["Ola"] },
    ]);
  });

  it("has no best time while nobody can make any hour", () => {
    expect(bestTimes([saturday], hours, [answer("Ola", [])])).toEqual([]);
    expect(bestTimes([saturday], hours, [])).toEqual([]);
  });
});

describe("cannotMake", () => {
  it("names every respondent outside the free set, in answer order", () => {
    const respondents = [answer("Ola", []), answer("Bartek", []), answer("Kasia", []), answer("Zosia", [])];

    expect(cannotMake(respondents, ["Kasia", "Ola"]).map((respondent) => respondent.name)).toEqual(["Bartek", "Zosia"]);
    expect(cannotMake(respondents, ["Ola", "Bartek", "Kasia", "Zosia"])).toEqual([]);
  });
});
