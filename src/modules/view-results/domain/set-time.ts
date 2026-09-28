import type { FinalTime, Results } from "../server/results-schema";
import { freeAt } from "./best-time";
import { setTimeShown } from "./time-label";

type Answer = Pick<Results["respondents"][number], "name" | "slots">;

export function whoComes<A extends Answer>(answers: A[], { date, firstHour, lastHour }: FinalTime) {
  const hours = Array.from({ length: lastHour - firstHour }, (_, index) => firstHour + index);
  const coming = hours.reduce((free, hour) => freeAt(free, { date, hour }), answers);

  return { coming, cannot: answers.filter((answer) => !coming.includes(answer)) };
}

export function setTimeMessage(final: FinalTime, { title, link }: { title: string; link: string }) {
  const { weekday, day, hours } = setTimeShown(final);

  return `${title}: ${weekday} ${day}, ${hours}. ${link}`;
}
