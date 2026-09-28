import { eventTimes, utcStamp, type FinalTime } from "./calendar-file";

type CalendarEvent = { title: string; link: string; timeZone: string; final: FinalTime };

function isoSeconds(instant: Date) {
  return instant.toISOString().replace(/\.\d{3}/, "");
}

export function googleCalendarLink({ title, link, timeZone, final }: CalendarEvent) {
  const { start, end } = eventTimes(final, timeZone);
  const query = new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${utcStamp(start)}/${utcStamp(end)}`, details: link });

  return `https://calendar.google.com/calendar/render?${query}`;
}

export function outlookCalendarLink({ title, link, timeZone, final }: CalendarEvent) {
  const { start, end } = eventTimes(final, timeZone);

  const query = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: title,
    startdt: isoSeconds(start),
    enddt: isoSeconds(end),
    body: link,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${query}`;
}
