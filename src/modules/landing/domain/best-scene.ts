import { bestTimes, cannotMake, heatCellOf } from "./best-time";
import { longRunLabel } from "./time-label";

const dates = ["2025-10-17", "2025-10-18", "2025-10-19"];
const hours = [17, 18, 19, 20, 21, 22];

const freeHoursByDate: Record<string, number[][]> = {
  Kuba: [[17, 18, 19], [19, 20, 21, 22], [17, 18]],
  Ola: [[18, 19, 20, 21], [17, 18], [17, 18, 19]],
  Michał: [[], [18, 19, 20, 21, 22], [17, 18, 19]],
  Zuza: [[17, 18, 19, 20], [19, 20, 21], []],
  Bartek: [[19, 20, 21, 22], [19, 20, 21, 22], [17, 18]],
  Kasia: [[18, 19, 20], [18, 19, 20, 21], [17]],
};

const answers = Object.entries(freeHoursByDate).map(([name, freeHours]) => ({
  name,
  slots: dates.flatMap((date, index) => freeHours[index].map((hour) => ({ date, hour }))),
}));

const [best] = bestTimes(dates, hours, answers);

export const bestPoll = {
  people: answers.map((answer) => answer.name),
  days: dates.map((date) => Number(date.slice(-2))),
  rows: hours.map((hour) => ({ hour, cells: dates.map((date) => heatCellOf(answers, { date, hour }, best)) })),
  best: {
    label: longRunLabel(best),
    share: `${best.free.length} z ${answers.length} może`,
    cannot: `Nie może: ${cannotMake(answers, best.free)
      .map((answer) => answer.name)
      .join(", ")}`,
  },
};

export function bestTimeAt(time: number) {
  return { risen: time > 0.1, settled: false };
}

export function settledAt(time: number) {
  return { risen: true, settled: time > 0.25 };
}
