import { describe, expect, it } from "vitest";
import { refusalOf } from "./answer-rules";

describe("refusalOf", () => {
  it("refuses a name someone else already holds, saying how many hours they marked", () => {
    expect(refusalOf({ nameHeldByOther: { name: "Ola", hours: 2 }, newcomer: false, participantCount: 3 })).toEqual({ reason: "name-taken", name: "Ola", hours: 2 });
  });

  it("refuses a newcomer once 30 people answered", () => {
    expect(refusalOf({ newcomer: true, participantCount: 30 })).toEqual({ reason: "full" });
  });

  it("lets someone already in a full poll change their answer", () => {
    expect(refusalOf({ newcomer: false, participantCount: 30 })).toBeUndefined();
  });

  it("lets the 30th person in", () => {
    expect(refusalOf({ newcomer: true, participantCount: 29 })).toBeUndefined();
  });
});
