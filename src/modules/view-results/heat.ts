export type Heat = 0 | 1 | 2 | 3 | 4 | 5;

const buckets = 5;

export function heatOf(free: number, respondents: number): Heat {
  if (free === 0) return 0;
  return Math.ceil((free * buckets) / respondents) as Heat;
}
