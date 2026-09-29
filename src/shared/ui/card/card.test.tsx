import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./card";

describe("Card", () => {
  it("groups its content under an optional label", () => {
    render(<Card label="Surface">Grupuje jedną rzecz na tle strony.</Card>);

    expect(screen.getByText("Surface")).toBeInTheDocument();
    expect(screen.getByText("Grupuje jedną rzecz na tle strony.")).toBeInTheDocument();
  });

  it("offers the ink and compact grounds of the preview", () => {
    render(
      <>
        <Card tone="ink">Jeden na ekran</Card>
        <Card size="compact">pt 17.10, 18–20</Card>
      </>,
    );

    expect(screen.getByText("Jeden na ekran")).toHaveAttribute("data-tone", "ink");
    expect(screen.getByText("pt 17.10, 18–20")).toHaveAttribute("data-size", "compact");
  });

  it("pulses once when asked, and only then", () => {
    render(
      <>
        <Card tone="ink" pulse>
          Sobota 19.10
        </Card>
        <Card tone="ink">Niedziela 20.10</Card>
      </>,
    );

    expect(screen.getByText("Sobota 19.10")).toHaveAttribute("data-pulse");
    expect(screen.getByText("Niedziela 20.10")).not.toHaveAttribute("data-pulse");
  });
});
