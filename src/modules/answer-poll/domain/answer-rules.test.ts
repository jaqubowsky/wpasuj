import { describe, expect, it } from "vitest";
import { refusalOf, takesOrganiserName } from "./answer-rules";

describe("refusalOf", () => {
  it("refuses a name someone else already holds, saying how many hours they marked", () => {
    expect(refusalOf({ nameHeldByOther: { name: "Ola", hours: 2 }, newcomer: false, participantCount: 3 })).toEqual({
      reason: "name-taken",
      name: "Ola",
      hours: 2,
    });
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

describe("takesOrganiserName", () => {
  it("keeps the organiser's name, in any case and spacing, from a device that is not the organiser's", () => {
    expect(takesOrganiserName({ name: " kuba ", organiserName: "Kuba", organiserDevice: false })).toBe(true);
  });

  it("lets the organiser's devices use it", () => {
    expect(takesOrganiserName({ name: "Kuba", organiserName: "Kuba", organiserDevice: true })).toBe(false);
  });

  it("lets a row that already holds it keep it", () => {
    expect(takesOrganiserName({ name: "Kuba", organiserName: "Kuba", organiserDevice: false, ownsName: true })).toBe(false);
  });

  it("leaves every other name free", () => {
    expect(takesOrganiserName({ name: "Ola", organiserName: "Kuba", organiserDevice: false })).toBe(false);
  });
});
