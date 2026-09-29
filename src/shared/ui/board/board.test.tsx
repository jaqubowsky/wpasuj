import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Board } from "./board";

describe("Board", () => {
  it("holds the grid and what goes with it on one card", () => {
    render(
      <Board>
        <p>Kliknij godzinę, żeby zobaczyć, kto może.</p>
      </Board>,
    );

    expect(screen.getByText("Kliknij godzinę, żeby zobaczyć, kto może.").parentElement?.tagName).toBe("SECTION");
  });
});
