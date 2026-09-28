import { describe, expect, it } from "vitest";
import { nameKey, normaliseName } from "./name-rules";

describe("normaliseName", () => {
  it("trims and collapses spaces", () => {
    expect(normaliseName("  Ola   Nowak \t")).toBe("Ola Nowak");
  });

  it("composes accents into one character", () => {
    expect(normaliseName("Łucja Zósia")).toBe("Łucja Zósia");
  });
});

describe("nameKey", () => {
  it("treats Polish capitals and their lower case as one name", () => {
    expect(nameKey("ŁUKASZ Żak")).toBe(nameKey("łukasz żak"));
  });

  it("treats a decomposed accent and its composed twin as one name", () => {
    expect(nameKey("Zósia")).toBe(nameKey("Zósia"));
  });

  it("keeps different names apart", () => {
    expect(nameKey("Ola")).not.toBe(nameKey("Ala"));
  });
});
