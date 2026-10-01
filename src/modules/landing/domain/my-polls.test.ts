import { describe, expect, it } from "vitest";
import { answersLine, livePolls, roleLine, settledLine } from "./my-polls";

describe("my polls on this device", () => {
  it("keeps a poll until 60 days after its last date", () => {
    const polls = [
      { id: "kino", lastDate: "2026-08-16" },
      { id: "grill", lastDate: "2026-08-15" },
    ];

    expect(livePolls(polls, "2026-10-15")).toEqual([{ id: "kino", lastDate: "2026-08-16" }]);
  });

  it("names the role and the first and last date", () => {
    expect(roleLine("organiser", ["2026-10-17", "2026-10-18"])).toBe("Twoja ankieta · sb 17.10 – nd 18.10");
    expect(roleLine("participant", ["2026-10-23", "2026-10-24", "2026-10-25"])).toBe("Odpowiadasz · pt 23.10 – nd 25.10");
  });

  it("names a single date once", () => {
    expect(roleLine("participant", ["2026-10-17"])).toBe("Odpowiadasz · sb 17.10");
  });

  it("counts the answers in Polish", () => {
    expect([0, 1, 2, 5, 22].map(answersLine)).toEqual([
      "Nikt jeszcze nie odpowiedział",
      "1 osoba odpowiedziała",
      "2 osoby odpowiedziały",
      "5 osób odpowiedziało",
      "22 osoby odpowiedziały",
    ]);
  });

  it("names the set time with its day and hours", () => {
    expect(settledLine({ date: "2026-10-17", firstHour: 19, lastHour: 22 })).toBe("Ustalone: sobota 17.10, 19–22");
  });

  it("names the next day for a set time that starts past midnight", () => {
    expect(settledLine({ date: "2026-10-17", firstHour: 24, lastHour: 27 })).toBe("Ustalone: niedziela 18.10, 0–3");
  });
});
