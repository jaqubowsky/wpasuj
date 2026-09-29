import { describe, expect, it } from "vitest";
import { draftPreview } from "./draft-preview";

describe("draftPreview", () => {
  it("speaks to you until you have a name and a plan", () => {
    expect(draftPreview({ title: " ", organiserName: "" })).toEqual({ asker: "Ty pytasz, kiedy możesz", title: "Wasz plan" });
  });

  it("reads as your friends will see the link", () => {
    expect(draftPreview({ title: " Grill u Oli ", organiserName: " Kuba " })).toEqual({
      asker: "Kuba pyta, kiedy możesz",
      title: "Grill u Oli",
    });
  });
});
