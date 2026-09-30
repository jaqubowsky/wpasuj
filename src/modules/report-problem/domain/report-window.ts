const windowLength = 60 * 60_000;
const reportsPerWindow = 5;

export function admitReport(earlier: number[], now: number) {
  const recent = earlier.filter((time) => now - time < windowLength);

  return recent.length < reportsPerWindow ? { admitted: true, times: [...recent, now] } : { admitted: false, times: recent };
}
