export const tryDays = [
  { short: "pt", long: "Piątek" },
  { short: "sb", long: "Sobota" },
  { short: "nd", long: "Niedziela" },
  { short: "pn", long: "Poniedziałek" },
];

export const tryHours = ["18:00", "19:00", "20:00", "21:00", "22:00"];

const people = 6;

const answered = [
  [1, 2, 1, 0],
  [2, 3, 2, 1],
  [3, 4, 3, 1],
  [2, 4, 2, 0],
  [1, 2, 1, 0],
];

export const noneMine = answered.map((row) => row.map(() => false));

export function toggleMine(mine: boolean[][], hour: number, day: number) {
  return mine.map((row, rowHour) => row.map((free, rowDay) => (rowHour === hour && rowDay === day ? !free : free)));
}

export function countsWith(mine: boolean[][]) {
  return answered.map((row, hour) => row.map((count, day) => count + Number(mine[hour][day])));
}

export function bestSlot(mine: boolean[][]) {
  let best = { hour: 0, day: 0, count: -1 };

  countsWith(mine).forEach((row, hour) =>
    row.forEach((count, day) => {
      if (count > best.count) best = { hour, day, count };
    }),
  );

  return { label: `${tryDays[best.day].long}, ${tryHours[best.hour]}`, count: best.count };
}

export function heatOf(count: number) {
  return Math.min(5, Math.ceil((count / people) * 5));
}
