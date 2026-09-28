import { describe, expect, it } from "vitest";
import { googleCalendarLink, outlookCalendarLink } from "./calendar-links";

const event = { title: "Planszówki, u Michała", link: "https://wpasuj.example/e/abcdefghij", timeZone: "Europe/Warsaw" };

describe("googleCalendarLink", () => {
  it("opens Google's event editor with the title and the poll link", () => {
    const url = new URL(googleCalendarLink({ ...event, final: { date: "2026-10-24", firstHour: 19, lastHour: 22 } }));

    expect(`${url.origin}${url.pathname}`).toBe("https://calendar.google.com/calendar/render");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("text")).toBe("Planszówki, u Michała");
    expect(url.searchParams.get("details")).toBe("https://wpasuj.example/e/abcdefghij");
  });

  it("gives a summer-time evening in UTC", () => {
    const url = new URL(googleCalendarLink({ ...event, final: { date: "2026-10-24", firstHour: 19, lastHour: 22 } }));

    expect(url.searchParams.get("dates")).toBe("20261024T170000Z/20261024T200000Z");
  });

  it("ends a set time 23–1 on 25.10 the next day in UTC", () => {
    const url = new URL(googleCalendarLink({ ...event, final: { date: "2026-10-25", firstHour: 23, lastHour: 25 } }));

    expect(url.searchParams.get("dates")).toBe("20261025T220000Z/20261026T000000Z");
  });

  it("keeps local hours through a night the clocks go back or forward", () => {
    const autumn = new URL(googleCalendarLink({ ...event, final: { date: "2026-10-24", firstHour: 22, lastHour: 28 } }));
    const spring = new URL(googleCalendarLink({ ...event, final: { date: "2027-03-27", firstHour: 22, lastHour: 28 } }));

    expect(autumn.searchParams.get("dates")).toBe("20261024T200000Z/20261025T030000Z");
    expect(spring.searchParams.get("dates")).toBe("20270327T210000Z/20270328T020000Z");
  });
});

describe("outlookCalendarLink", () => {
  it("opens Outlook's new event with the title and the poll link", () => {
    const url = new URL(outlookCalendarLink({ ...event, final: { date: "2026-10-24", firstHour: 19, lastHour: 22 } }));

    expect(`${url.origin}${url.pathname}`).toBe("https://outlook.live.com/calendar/0/deeplink/compose");
    expect(url.searchParams.get("path")).toBe("/calendar/action/compose");
    expect(url.searchParams.get("rru")).toBe("addevent");
    expect(url.searchParams.get("subject")).toBe("Planszówki, u Michała");
    expect(url.searchParams.get("body")).toBe("https://wpasuj.example/e/abcdefghij");
  });

  it("gives a set time past midnight in UTC", () => {
    const url = new URL(outlookCalendarLink({ ...event, final: { date: "2026-10-25", firstHour: 23, lastHour: 25 } }));

    expect(url.searchParams.get("startdt")).toBe("2026-10-25T22:00:00Z");
    expect(url.searchParams.get("enddt")).toBe("2026-10-26T00:00:00Z");
  });

  it("keeps local hours through the night the clocks go back", () => {
    const url = new URL(outlookCalendarLink({ ...event, final: { date: "2026-10-24", firstHour: 22, lastHour: 28 } }));

    expect(url.searchParams.get("startdt")).toBe("2026-10-24T20:00:00Z");
    expect(url.searchParams.get("enddt")).toBe("2026-10-25T03:00:00Z");
  });
});
