import { shortWeekday } from "@/shared/dates/format";
import { heatCellOf, type Answer } from "./best-time";

export const storyDates = ["2025-10-17", "2025-10-18", "2025-10-19"];
export const storyHours = [17, 18, 19, 20, 21, 22];

const freeHoursByDate: Record<string, number[][]> = {
  Kuba: [
    [17, 18, 19],
    [19, 20, 21, 22],
    [17, 18],
  ],
  Ola: [
    [18, 19, 20, 21],
    [17, 18],
    [17, 18, 19],
  ],
  Michał: [[], [18, 19, 20, 21, 22], [17, 18, 19]],
  Zuza: [[17, 18, 19, 20], [19, 20, 21], []],
  Bartek: [
    [19, 20, 21, 22],
    [19, 20, 21, 22],
    [17, 18],
  ],
  Kasia: [[18, 19, 20], [18, 19, 20, 21], [17]],
};

export const storyAnswers: Answer[] = Object.entries(freeHoursByDate).map(([name, freeHours]) => ({
  name,
  slots: storyDates.flatMap((date, index) => freeHours[index].map((hour) => ({ date, hour }))),
}));

export const storyDays = storyDates.map((date) => `${shortWeekday(date)} ${Number(date.slice(-2))}`);

export function heatRows(answers: Answer[]) {
  return storyHours.map((hour) => ({ hour, cells: storyDates.map((date) => heatCellOf(answers, { date, hour })) }));
}
