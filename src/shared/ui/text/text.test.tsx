import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Text } from "./text";

describe("Text", () => {
  it("renders the words in the element and style the role asks for", () => {
    render(
      <Text as="h1" variant="title">
        Planszówki u Michała
      </Text>,
    );

    const title = screen.getByRole("heading", { level: 1, name: "Planszówki u Michała" });
    expect(title).toHaveAttribute("data-variant", "title");
  });


  it("renders a span when no element is named", () => {
    render(<Text variant="meta">sb · 19:00</Text>);

    expect(screen.getByText("sb · 19:00").tagName).toBe("SPAN");
  });
});
