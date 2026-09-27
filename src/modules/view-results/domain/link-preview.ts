import { clockEndHour, summaryOfDates } from "@/shared/dates/format";

type PreviewedPoll = { organiserName: string; title: string; dates: string[]; firstHour: number; hourCount: number };
type Box = { width: number; height: number };

function partOfDay(firstHour: number, hourCount: number) {
  if (firstHour === 17 && hourCount === 6) return "wieczorem";
  if (firstHour === 10 && hourCount === 13) return "cały dzień";
  return `${firstHour}–${clockEndHour(firstHour + hourCount)}`;
}

export function linkPreview({ organiserName, title, dates, firstHour, hourCount }: PreviewedPoll) {
  return {
    asker: `${organiserName} pyta, kiedy możesz`,
    title,
    when: `${summaryOfDates(dates)}, ${partOfDay(firstHour, hourCount)}`,
  };
}

export function miniGrid(columns: number, rows: number, box: Box) {
  const gap = Math.min(10, Math.floor(box.height / rows / 4));
  const tileWidth = Math.floor((box.width - gap * (columns - 1)) / columns);
  const tileHeight = Math.min(58, Math.floor((box.height - gap * (rows - 1)) / rows));
  return { tileWidth, tileHeight, gap, radius: Math.min(14, Math.floor(tileHeight / 4)) };
}
