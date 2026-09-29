import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Quote } from "./quote";
import { stubReducedMotion, stubIntersection } from "@/shared/testing/motion";

let intersection: ReturnType<typeof stubIntersection>;

beforeEach(() => {
  localStorage.clear();

  intersection = stubIntersection();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const counter = () => screen.getByText("wiadomości później", { exact: false });
const answer = () => screen.getByRole("figure", { name: "Grill na działce u Oli" }).parentElement!;

describe("Quote", () => {
  it("counts the messages up to 47 once in view, then lets the link arrive", () => {
    vi.useFakeTimers();
    stubReducedMotion(false);
    render(<Quote host="wpasuj.pl" />);

    expect(counter()).toHaveTextContent(/^047 wiadomości później$/);
    expect(answer()).not.toHaveAttribute("data-seen");

    act(() => intersection.reveal());
    act(() => vi.advanceTimersByTime(34 * 20));

    expect(counter()).toHaveTextContent(/^2047 wiadomości później$/);

    act(() => vi.advanceTimersByTime(34 * 27));

    expect(counter()).toHaveTextContent(/^4747 wiadomości później$/);
    expect(answer()).toHaveAttribute("data-seen");
  });

  it("shows 47 and the link at once under reduced motion", () => {
    stubReducedMotion(true);
    render(<Quote host="wpasuj.pl" />);

    expect(counter()).toHaveTextContent(/^4747 wiadomości później$/);
    expect(answer()).toHaveAttribute("data-seen");
  });
});
