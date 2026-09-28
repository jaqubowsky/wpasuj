import { bestTimes, cannotMake, heatCellOf, type Answer, type Run } from "./best-time";
import { longRunLabel, shortRunLabel } from "./time-label";

type Slot = { date: string; hour: number };

export const demoDates = ["2025-10-17", "2025-10-18", "2025-10-19", "2025-10-20"];
export const demoHours = [18, 19, 20, 21, 22];
export const visitor = "Ty";

const freeHoursByDate: Record<string, number[][]> = {
  Ola: [[19, 20, 21], [18, 19, 20], [], [20, 21, 22]],
  Bartek: [[18, 19, 20, 21], [19, 20, 21, 22], [18, 19], [21, 22]],
  Kasia: [[20, 21, 22], [19, 20, 21], [18, 19, 20], []],
  Michał: [[19, 20], [19, 20, 21, 22], [19, 20], [20, 21]],
};

export const friends = Object.keys(freeHoursByDate);

const friendAnswers: Answer[] = Object.entries(freeHoursByDate).map(([name, freeHours]) => ({
  name,
  slots: demoDates.flatMap((date, index) => freeHours[index].map((hour) => ({ date, hour }))),
}));

export function demoPoll(mine: Slot[]) {
  const respondents = [...friendAnswers, { name: visitor, slots: mine }];
  const [best, ...others] = bestTimes(demoDates, demoHours, respondents);
  const share = (run: Run) => `${run.free.length} z ${respondents.length}`;

  return {
    best: {
      label: longRunLabel(best),
      share: share(best),
      cannot: cannotMake(respondents, best.free).map((answer) => answer.name),
    },
    respondentCount: respondents.length,
    others: others.map((run) => ({ label: shortRunLabel(run), share: share(run) })),
    cellAt: (cell: Slot) => heatCellOf(respondents, cell),
  };
}
