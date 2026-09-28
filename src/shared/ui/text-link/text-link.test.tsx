import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { TextLink } from "./text-link";

it("links the words to the page it names", () => {
  render(<TextLink href="/">Zrób własną ankietę</TextLink>);

  expect(screen.getByRole("link", { name: "Zrób własną ankietę" })).toHaveAttribute("href", "/");
});
