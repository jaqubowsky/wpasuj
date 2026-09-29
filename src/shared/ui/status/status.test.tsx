import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Status } from "./status";

describe("Status", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ["saving", "Zapisuję"],
    ["saved", "Zapisane"],
    ["failed", "Nie zapisano"],
  ] as const)("says %s in one word", (state, word) => {
    render(<Status state={state} />);

    expect(screen.getByRole("status")).toHaveTextContent(word);
  });

  it("keeps one live region from before the first word, so screen readers hear every change", () => {
    const { rerender } = render(<Status />);
    const region = screen.getByRole("status");

    expect(region).toBeEmptyDOMElement();

    rerender(<Status state="saving" />);

    expect(screen.getByRole("status")).toBe(region);
    expect(region).toHaveTextContent("Zapisuję");
  });

  it("fades Zapisane a moment after each save and keeps saying it", () => {
    const { rerender } = render(<Status state="saving" />);

    rerender(<Status state="saved" />);
    act(() => vi.advanceTimersByTime(1599));

    expect(screen.getByRole("status")).not.toHaveAttribute("data-faded");

    act(() => vi.advanceTimersByTime(1));

    expect(screen.getByRole("status")).toHaveAttribute("data-faded");
    expect(screen.getByRole("status")).toHaveTextContent("Zapisane");

    rerender(<Status state="saving" />);

    expect(screen.getByRole("status")).not.toHaveAttribute("data-faded");

    rerender(<Status state="saved" />);

    expect(screen.getByRole("status")).not.toHaveAttribute("data-faded");
  });

  it.each(["saving", "failed"] as const)("keeps %s in view", (state) => {
    render(<Status state={state} />);
    act(() => vi.advanceTimersByTime(10_000));

    expect(screen.getByRole("status")).not.toHaveAttribute("data-faded");
  });

  it("opens on an answer saved earlier with Zapisane already faded, so nothing moves on load", () => {
    render(<Status state="saved" />);

    expect(screen.getByRole("status")).toHaveAttribute("data-faded");
    expect(screen.getByRole("status")).toHaveTextContent("Zapisane");
  });
});
