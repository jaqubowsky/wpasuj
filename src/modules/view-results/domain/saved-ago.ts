const relative = new Intl.RelativeTimeFormat("pl", { numeric: "auto", style: "short" });

const units = [
  { unit: "day", ms: 86_400_000 },
  { unit: "hour", ms: 3_600_000 },
  { unit: "minute", ms: 60_000 },
] as const;

export function savedAgo(savedAt: number, now: number) {
  const ago = now - savedAt;
  const unit = units.find(({ ms }) => ago >= ms);
  if (!unit) return "przed chwilą";
  return relative.format(-Math.floor(ago / unit.ms), unit.unit);
}
