const dayInMs = 86_400_000;

export function addDays(date: string, days: number) {
  return new Date(Date.parse(date) + days * dayInMs).toISOString().slice(0, 10);
}

export function todayIn(timeZone: string, now: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(now);
}
