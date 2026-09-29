import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { LinkCard } from "./link-card";

it("reads like the link preview a group chat unfurls", () => {
  render(
    <LinkCard
      asker="Kuba pyta, kiedy możesz"
      title="Grill na działce u Oli"
      tone="coral"
      host="wpasuj.pl"
      note="jeden link zamiast wszystkiego"
    />,
  );

  const card = screen.getByRole("figure", { name: "Grill na działce u Oli" });

  expect(card).toHaveTextContent("Kuba pyta, kiedy możesz");
  expect(card).toHaveTextContent("wpasuj.pl");
  expect(card).toHaveTextContent("jeden link zamiast wszystkiego");
});
