import { describe, expect, it } from "vitest";
import { createFormAt } from "./create-form";

describe("createFormAt", () => {
  it("starts with an empty title and nothing chosen", () => {
    expect(createFormAt(0)).toEqual({ title: "", weekend: false, evening: false, pressed: false });
  });

  it("has typed most of the title halfway, before anything is chosen", () => {
    expect(createFormAt(0.5)).toEqual({ title: "Planszówki u Micha", weekend: false, evening: false, pressed: false });
  });

  it("ends with the whole title, the weekend and the evening chosen and the button at rest", () => {
    expect(createFormAt(1)).toEqual({ title: "Planszówki u Michała", weekend: true, evening: true, pressed: false });
  });

  it("presses the button just before the step ends", () => {
    expect(createFormAt(0.9).pressed).toBe(true);
  });
});
