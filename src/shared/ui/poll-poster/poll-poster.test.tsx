import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PollPoster } from "./poll-poster";

describe("PollPoster", () => {
  it("heads the page with the poll's title, who asks above it and the count below", () => {
    render(
      <PollPoster tone="coral" eyebrow="Kuba pyta" title="Grill u Oli">
        5 osób już odpowiedziało
      </PollPoster>,
    );

    const title = screen.getByRole("heading", { level: 1 });

    expect(title).toHaveTextContent("Grill u Oli");
    expect(screen.getByText("Kuba pyta").compareDocumentPosition(title)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(title.compareDocumentPosition(screen.getByText("5 osób już odpowiedziało"))).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("paints the organiser's poster ink and a friend's coral, with the wave in the same colour", () => {
    const { container } = render(
      <>
        <PollPoster tone="ink" eyebrow="Pytasz jako Kuba" title="Grill u Oli" />
        <PollPoster tone="coral" eyebrow="Kuba pyta" title="Grill u Oli" />
      </>,
    );

    const [ink, coral] = container.querySelectorAll("[data-poll-poster]");

    expect(ink).toHaveAttribute("data-tone", "ink");
    expect(ink.nextElementSibling).toHaveAttribute("data-tone", "ink");
    expect(coral).toHaveAttribute("data-tone", "coral");
    expect(coral.nextElementSibling).toHaveAttribute("data-tone", "coral");
  });

  it("heads a settled poll with its day and hours instead of the title, stamped Widzimy się", () => {
    render(
      <PollPoster tone="coral" eyebrow="Grill u Oli" when={{ weekday: "Sobota", day: "3 października", hours: "19:00–21:00" }}>
        Ustalone przez: Kuba
      </PollPoster>,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Sobota 3 października 19:00–21:00");
    expect(screen.getByText("Widzimy się")).toBeVisible();
    expect(screen.getByText("Ustalone przez: Kuba")).toBeVisible();
  });
});
