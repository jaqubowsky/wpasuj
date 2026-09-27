import { describe, expect, it } from "vitest";
import { linkScene } from "./link-scene";

describe("linkScene", () => {
  it("shows only the chat as the step begins", () => {
    expect(linkScene(0)).toEqual({ preview: false, reply: false });
  });

  it("has dropped the link preview and the reply by the middle of the step", () => {
    expect(linkScene(0.5)).toEqual({ preview: true, reply: true });
  });

  it("ends with the preview and the reply in the chat", () => {
    expect(linkScene(1)).toEqual({ preview: true, reply: true });
  });

  it("drops the preview before the reply", () => {
    expect(linkScene(0.2)).toEqual({ preview: true, reply: false });
  });
});
