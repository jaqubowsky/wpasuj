import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Status } from "./status";

describe("Status", () => {
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
});
