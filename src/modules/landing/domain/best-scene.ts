import { bestTimes } from "./best-time";
import { peopleCount } from "./people-count";
import { heatRows, storyAnswers, storyDates, storyDays, storyHours } from "./story-group";
import { longRunLabel, setTimeLabel } from "./time-label";

const [best] = bestTimes(storyDates, storyHours, storyAnswers);

export const bestPoll = {
  people: storyAnswers.map((answer) => answer.name),
  count: peopleCount(storyAnswers.length),
  days: storyDays,
  rows: heatRows(storyAnswers),
  best: longRunLabel(best),
};

export const invitation = {
  ...setTimeLabel(best),
  coming: best.free,
};

export function bestTimeAt(time: number) {
  return time > 0.1;
}
