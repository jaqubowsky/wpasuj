import { clockEndHour, dayNumber, shortWeekday, summaryOfDates } from "@/shared/dates/format";
import { addDays } from "@/shared/dates/iso-date";
import { tintOf } from "@/shared/tint";
import type { FinalTime, Results } from "../server/results-schema";
import { answeredCount, peopleCount } from "./people-count";
import { whoComes } from "./set-time";
import { setTimeShown } from "./time-label";

type Respondent = { name: string; normalisedName: string };
type PreviewedPoll = {
  organiserName: string;
  title: string;
  dates: string[];
  firstHour: number;
  hourCount: number;
  respondents: Respondent[];
};

const shownAvatars = 6;

function hoursOfDay(firstHour: number, hourCount: number) {
  const range = `${firstHour}:00–${clockEndHour(firstHour + hourCount)}:00`;

  if (firstHour === 17 && hourCount === 6) return `wieczorem, ${range}`;
  if (firstHour === 10 && hourCount === 13) return `cały dzień, ${range}`;

  return range;
}

function daysInRows(dates: string[]) {
  return dates.reduce<string[][]>((rows, date) => {
    const row = rows.at(-1);

    if (row && addDays(row.at(-1)!, 1) === date) row.push(date);
    else rows.push([date]);

    return rows;
  }, []);
}

function summaryOfDays(dates: string[]) {
  const shown = daysInRows(dates).flatMap((row) =>
    row.length >= 3
      ? [
          { date: row[0], before: ", " },
          { date: row.at(-1)!, before: " – " },
        ]
      : row.map((date) => ({ date, before: ", " })),
  );

  return shown
    .map(({ date, before }, index) => {
      const closesMonth = shown[index + 1]?.date.slice(0, 7) !== date.slice(0, 7);
      const day = closesMonth ? summaryOfDates([date]) : `${shortWeekday(date)} ${dayNumber(date)}`;

      return index === 0 ? day : `${before}${day}`;
    })
    .join("");
}

type SetPoll = {
  organiserName: string;
  title: string;
  final: FinalTime;
  respondents: (Respondent & Pick<Results["respondents"][number], "slots">)[];
};

function avatarsOf(people: Respondent[]) {
  return {
    avatars: people.slice(0, shownAvatars).map(({ name, normalisedName }) => ({
      initial: Array.from(name.trim())[0].toLocaleUpperCase("pl"),
      tint: tintOf(normalisedName),
    })),
    more: Math.max(0, people.length - shownAvatars),
  };
}

function respondentsOf(respondents: Respondent[]) {
  return {
    ...avatarsOf(respondents),
    answered: respondents.length === 0 ? "Zaznacz, kiedy możesz" : answeredCount(respondents.length),
  };
}

export function linkPreview({ organiserName, title, dates, firstHour, hourCount, respondents }: PreviewedPoll) {
  return {
    asker: `${organiserName} pyta, kiedy możesz`,
    title,
    days: summaryOfDays(dates).replace(/(\p{L}) (\d)/gu, "$1\u00a0$2"),
    hours: hoursOfDay(firstHour, hourCount),
    respondents: respondentsOf(respondents),
  };
}

export function setTimePreview({ organiserName, title, final, respondents }: SetPoll) {
  const { weekday, day, hours } = setTimeShown(final);
  const { coming } = whoComes(respondents, final);

  return {
    setBy: `Ustalone przez: ${organiserName}`,
    title,
    day: `${weekday}, ${day}`,
    hours,
    coming: coming.length === 0 ? undefined : { ...avatarsOf(coming), label: `Będzie ${peopleCount(coming.length)}` },
  };
}

export function linkPreviewVersion(final: FinalTime | null) {
  return final ? `ustalone-${final.date}-${final.firstHour}-${final.lastHour}` : "otwarta";
}
