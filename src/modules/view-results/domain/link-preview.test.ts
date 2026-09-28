import { tintOf } from "@/shared/tint";
import { describe, expect, it } from "vitest";
import { linkPreview, linkPreviewVersion, setTimePreview } from "./link-preview";

const poll = {
  organiserName: "Kuba",
  title: "Planszówki u Michała",
  dates: ["2030-10-18", "2030-10-19", "2030-10-20"],
  firstHour: 17,
  hourCount: 6,
  respondents: [],
};

const nbsp = " ";

function respondentsNamed(count: number) {
  return Array.from({ length: count }, (_, index) => ({ name: `Osoba ${index + 1}`, normalisedName: `osoba ${index + 1}` }));
}

describe("linkPreview", () => {
  it("asks the question in the organiser's name", () => {
    expect(linkPreview(poll).asker).toBe("Kuba pyta, kiedy możesz");
  });

  it("names the dates, keeping each weekday with its day", () => {
    expect(linkPreview(poll).days).toBe(`pt${nbsp}18 – nd${nbsp}20 października`);
  });

  it("names three or more days in a row as a range, across a month too", () => {
    expect(linkPreview({ ...poll, dates: ["2030-10-30", "2030-10-31", "2030-11-01"] }).days).toBe(
      `śr${nbsp}30 października – pt${nbsp}1 listopada`,
    );

    expect(linkPreview({ ...poll, dates: ["2030-10-14", "2030-10-16", "2030-10-17", "2030-10-18"] }).days).toBe(
      `pn${nbsp}14, śr${nbsp}16 – pt${nbsp}18 października`,
    );
  });

  it("lists two days in a row one by one", () => {
    expect(linkPreview({ ...poll, dates: ["2030-10-18", "2030-10-19"] }).days).toBe(`pt${nbsp}18, sb${nbsp}19 października`);
  });

  it("names the evening with its hours", () => {
    expect(linkPreview(poll).hours).toBe("wieczorem, 17:00–23:00");
  });

  it("names the whole day with its hours", () => {
    expect(linkPreview({ ...poll, firstHour: 10, hourCount: 13 }).hours).toBe("cały dzień, 10:00–23:00");
  });

  it("names a custom range by its hours", () => {
    expect(linkPreview({ ...poll, firstHour: 8, hourCount: 4 }).hours).toBe("8:00–12:00");
  });

  it("names a night past midnight by the clock", () => {
    expect(linkPreview({ ...poll, firstHour: 22, hourCount: 6 }).hours).toBe("22:00–4:00");
  });

  it("invites the first answer while nobody has answered", () => {
    expect(linkPreview(poll).respondents).toEqual({ avatars: [], more: 0, answered: "Zaznacz, kiedy możesz" });
  });

  it("shows each respondent's capital initial in their avatar tint, in answer order", () => {
    const respondents = [
      { name: "Ola", normalisedName: "ola" },
      { name: "łucja", normalisedName: "łucja" },
      { name: "Michał", normalisedName: "michał" },
    ];

    expect(linkPreview({ ...poll, respondents }).respondents).toEqual({
      avatars: [
        { initial: "O", tint: tintOf("ola") },
        { initial: "Ł", tint: tintOf("łucja") },
        { initial: "M", tint: tintOf("michał") },
      ],
      more: 0,
      answered: "3 osoby już odpowiedziały",
    });
  });

  it("caps the avatars at six and counts the rest", () => {
    const { avatars, more, answered } = linkPreview({ ...poll, respondents: respondentsNamed(30) }).respondents;

    expect(avatars).toHaveLength(6);
    expect(more).toBe(24);
    expect(answered).toBe("30 osób już odpowiedziało");
  });
});

const saturdayEvening = { date: "2030-10-26", firstHour: 19, lastHour: 21 };

const setPoll = { organiserName: "Kuba", title: "Planszówki u Michała", final: saturdayEvening, respondents: [] };

function answer(name: string, hours: number[]) {
  return { name, normalisedName: name.toLocaleLowerCase("pl"), slots: hours.map((hour) => ({ date: saturdayEvening.date, hour })) };
}

describe("setTimePreview", () => {
  it("says who set the time, and the day and hours as the invitation says them", () => {
    expect(setTimePreview(setPoll)).toMatchObject({
      setBy: "Ustalone przez: Kuba",
      title: "Planszówki u Michała",
      day: "Sobota, 26 października",
      hours: "19:00–21:00",
    });
  });

  it("shows only those free for the whole set time as coming", () => {
    const respondents = [answer("Ola", [19, 20]), answer("Bartek", [19]), answer("Michał", [19, 20, 21])];

    expect(setTimePreview({ ...setPoll, respondents }).coming).toEqual({
      avatars: [
        { initial: "O", tint: tintOf("ola") },
        { initial: "M", tint: tintOf("michał") },
      ],
      more: 0,
      label: "Będzie 2 osoby",
    });
  });

  it("drops the coming row when nobody comes", () => {
    expect(setTimePreview({ ...setPoll, respondents: [answer("Bartek", [])] }).coming).toBeUndefined();
  });

  it("caps the avatars of those coming at six and counts the rest", () => {
    const respondents = Array.from({ length: 30 }, (_, index) => answer(`Osoba ${index + 1}`, [19, 20]));
    const { avatars, more, label } = setTimePreview({ ...setPoll, respondents }).coming!;

    expect(avatars).toHaveLength(6);
    expect(more).toBe(24);
    expect(label).toBe("Będzie 30 osób");
  });
});

describe("linkPreviewVersion", () => {
  it("names an open poll's card", () => {
    expect(linkPreviewVersion(null)).toBe("otwarta");
  });

  it("names a set poll's card by its day and hours, so each set time has its own", () => {
    expect(linkPreviewVersion(saturdayEvening)).toBe("ustalone-2030-10-26-19-21");
  });
});
