import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { forgetPolls, rememberPoll, useDevicePolls } from "./device-polls";

beforeEach(() => localStorage.clear());

const kino = { id: "kino-12345", role: "organiser", lastDate: "2026-10-17" } as const;
const grill = { id: "grill-1234", role: "participant", lastDate: "2026-10-26" } as const;

describe("polls on this device", () => {
  it("holds none on a new device", () => {
    const { result } = renderHook(() => useDevicePolls());

    expect(result.current).toEqual([]);
  });

  it("lists the newest poll first", () => {
    rememberPoll(kino);
    rememberPoll(grill);

    const { result } = renderHook(() => useDevicePolls());

    expect(result.current).toEqual([grill, kino]);
  });

  it("keeps the organiser's role when the organiser answers their own poll", () => {
    rememberPoll(kino);
    rememberPoll({ ...kino, role: "participant" });

    const { result } = renderHook(() => useDevicePolls());

    expect(result.current).toEqual([kino]);
  });

  it("shows a poll remembered while the page is open", () => {
    const { result } = renderHook(() => useDevicePolls());

    act(() => rememberPoll(kino));

    expect(result.current).toEqual([kino]);
  });

  it("drops the polls it is told to forget", () => {
    rememberPoll(kino);
    rememberPoll(grill);
    const { result } = renderHook(() => useDevicePolls());

    act(() => forgetPolls([kino.id]));

    expect(result.current).toEqual([grill]);
  });

  it("starts over when the stored list is not one it wrote", () => {
    localStorage.setItem("device-polls", '[{"id":1}]');

    const { result } = renderHook(() => useDevicePolls());

    expect(result.current).toEqual([]);
  });
});
