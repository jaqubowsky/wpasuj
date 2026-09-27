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
});
