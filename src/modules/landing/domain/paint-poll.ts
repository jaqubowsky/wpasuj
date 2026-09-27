type Cell = { column: number; row: number };

export const paintDays = [17, 18, 19];
export const paintHours = [17, 18, 19, 20, 21, 22];

const path: Cell[] = [
  { column: 0, row: 0 },
  { column: 0, row: 1 },
  { column: 0, row: 2 },
  { column: 0, row: 3 },
  { column: 1, row: 2 },
  { column: 1, row: 3 },
  { column: 1, row: 4 },
];

export function paintPollAt(time: number) {
  const painted = path.slice(0, Math.floor(Math.min(time * 1.3, 1) * path.length));
  return { painted, finger: time < 1 ? painted.at(-1) : undefined };
}
