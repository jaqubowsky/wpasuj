import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SettledBadge } from "./settled-badge";

describe("SettledBadge", () => {
  it("says the time is settled in one word", () => {
    render(<SettledBadge />);

    expect(screen.getByText("Ustalone")).toBeInTheDocument();
  });
});
