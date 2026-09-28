import { peopleCount } from "./people-count";
import { heatRows, storyAnswers, storyDays } from "./story-group";

export function heatScene(time: number) {
  const joined = Math.min(storyAnswers.length, 1 + Math.floor(time * 1.2 * storyAnswers.length));
  const answers = storyAnswers.map(({ name, slots }, index) => ({ name, slots: index < joined ? slots : [] }));

  return {
    days: storyDays,
    count: peopleCount(joined),
    people: storyAnswers.map(({ name }, index) => ({ name, joined: index < joined })),
    rows: heatRows(answers),
  };
}
