import { describe, expect, it } from "vitest";
import { railFill, sceneTime, storyMoment } from "./story-moment";

describe("storyMoment over seven steps", () => {
  it("starts at the first step's beginning", () => {
    expect(storyMoment(0, 7)).toEqual({ step: 0, time: 0 });
  });

  it("is halfway through the first step at a fourteenth of the way", () => {
    expect(storyMoment(1 / 14, 7)).toEqual({ step: 0, time: 0.5 });
  });

  it("opens the third step exactly at its boundary", () => {
    expect(storyMoment(2 / 7, 7)).toEqual({ step: 2, time: 0 });
  });

  it("ends the last step at the end", () => {
    expect(storyMoment(1, 7)).toEqual({ step: 6, time: 1 });
  });

  it("holds the first step before the story starts", () => {
    expect(storyMoment(-0.3, 7)).toEqual({ step: 0, time: 0 });
  });

  it("holds the last step after the story ends", () => {
    expect(storyMoment(1.4, 7)).toEqual({ step: 6, time: 1 });
  });
});

describe("railFill over seven steps", () => {
  it("reaches the middle of the first label at the start", () => {
    expect(railFill({ step: 0, time: 0 }, 7)).toBeCloseTo(0.5 / 7);
  });

  it("stays full at the end of the last step", () => {
    expect(railFill({ step: 6, time: 1 }, 7)).toBe(1);
  });
});

describe("sceneTime", () => {
  it("runs the current scene at the story's in-step time", () => {
    expect(sceneTime(2, { step: 2, time: 0.4 })).toBe(0.4);
  });

  it("holds a past scene at its end", () => {
    expect(sceneTime(1, { step: 2, time: 0.4 })).toBe(1);
  });

  it("holds a coming scene at its start", () => {
    expect(sceneTime(3, { step: 2, time: 0.4 })).toBe(0);
  });
});
