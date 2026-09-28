import { clockEndHour, dayNumber, shortWeekday, summaryOfDates } from "@/shared/dates/format";
import { addDays } from "@/shared/dates/iso-date";

type PreviewedPoll = { organiserName: string; title: string; dates: string[]; firstHour: number; hourCount: number };
type Box = { width: number; height: number };

function partOfDay(firstHour: number, hourCount: number) {
  if (firstHour === 17 && hourCount === 6) return "wieczorem";
  if (firstHour === 10 && hourCount === 13) return "cały dzień";
  return `${firstHour}–${clockEndHour(firstHour + hourCount)}`;
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
    row.length >= 3 ? [{ date: row[0], before: ", " }, { date: row.at(-1)!, before: " – " }] : row.map((date) => ({ date, before: ", " })),
  );
  return shown
    .map(({ date, before }, index) => {
      const closesMonth = shown[index + 1]?.date.slice(0, 7) !== date.slice(0, 7);
      const day = closesMonth ? summaryOfDates([date]) : `${shortWeekday(date)} ${dayNumber(date)}`;
      return index === 0 ? day : `${before}${day}`;
    })
    .join("");
}

export function linkPreview({ organiserName, title, dates, firstHour, hourCount }: PreviewedPoll) {
  return {
    asker: `${organiserName} pyta, kiedy możesz`,
    title,
    when: `${summaryOfDays(dates)}, ${partOfDay(firstHour, hourCount)}`,
  };
}

export function miniGrid(columns: number, rows: number, box: Box) {
  const gap = Math.min(10, Math.floor(box.height / rows / 4));
  const tileWidth = Math.floor((box.width - gap * (columns - 1)) / columns);
  const tileHeight = Math.min(58, Math.floor((box.height - gap * (rows - 1)) / rows));
  return { tileWidth, tileHeight, gap, radius: Math.min(14, Math.floor(tileHeight / 4)) };
}
