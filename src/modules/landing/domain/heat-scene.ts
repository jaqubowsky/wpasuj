import { shortWeekday } from "@/shared/dates/format";
import { heatCellOf } from "./best-time";
import { peopleCount } from "./people-count";

const dates = ["2025-10-17", "2025-10-18", "2025-10-19"];
const hours = [17, 18, 19, 20, 21, 22];

const freeHoursByDay: Record<string, number[][]> = {
  Kuba: [[17, 18, 19], [19, 20, 21, 22], [17, 18]],
  Ola: [[18, 19, 20, 21], [17, 18], [17, 18, 19]],
  Michał: [[], [18, 19, 20, 21, 22], [17, 18, 19]],
  Zuza: [[17, 18, 19, 20], [19, 20, 21], []],
  Bartek: [[19, 20, 21, 22], [19, 20, 21, 22], [17, 18]],
  Kasia: [[18, 19, 20], [18, 19, 20, 21], [17]],
};

const people = Object.entries(freeHoursByDay).map(([name, freeHours]) => ({
  name,
  slots: dates.flatMap((date, index) => freeHours[index].map((hour) => ({ date, hour }))),
}));

export function heatScene(time: number) {
  const joined = Math.min(people.length, 1 + Math.floor(time * 1.2 * people.length));
  const answers = people.map(({ name, slots }, index) => ({ name, slots: index < joined ? slots : [] }));

  return {
    days: dates.map((date) => `${shortWeekday(date)} ${Number(date.slice(-2))}`),
    count: peopleCount(joined),
    people: people.map(({ name }, index) => ({ name, joined: index < joined })),
    rows: hours.map((hour) => ({ hour, cells: dates.map((date) => heatCellOf(answers, { date, hour })) })),
  };
}
