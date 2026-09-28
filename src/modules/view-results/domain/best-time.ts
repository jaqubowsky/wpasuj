import type { Results } from "../server/results-schema";

type Answer = Pick<Results["respondents"][number], "name" | "slots">;
type Slot = Answer["slots"][number];
export type Run = { date: string; firstHour: number; lastHour: number; free: string[] };

const shownTimes = 3;

export function freeAt<A extends Answer>(answers: A[], { date, hour }: Slot) {
  return answers.filter((answer) => answer.slots.some((slot) => slot.date === date && slot.hour === hour));
}

export function cannotMake<A extends Answer>(answers: A[], free: string[]) {
  return answers.filter((answer) => !free.includes(answer.name));
}

export function runsOf(dates: string[], hours: number[], answers: Answer[]): Run[] {
  return dates.flatMap((date) => {
    const runs: Run[] = [];

    for (const hour of hours) {
      const free = freeAt(answers, { date, hour }).map((answer) => answer.name);
      const last = runs.at(-1);

      if (last && last.lastHour === hour && last.free.join("\n") === free.join("\n")) last.lastHour = hour + 1;
      else runs.push({ date, firstHour: hour, lastHour: hour + 1, free });
    }

    return runs.filter((run) => run.free.length > 0);
  });
}

function length(run: Run) {
  return run.lastHour - run.firstHour;
}

export function bestTimes(dates: string[], hours: number[], answers: Answer[]): Run[] {
  return runsOf(dates, hours, answers)
    .toSorted((a, b) => b.free.length - a.free.length || length(b) - length(a) || a.date.localeCompare(b.date) || a.firstHour - b.firstHour)
    .slice(0, shownTimes);
}
