import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { Footer } from "./footer";

it("links the privacy policy, the terms and the contact address", () => {
  render(<Footer />);

  const footer = within(screen.getByRole("contentinfo"));

  expect(footer.getByRole("link", { name: "Polityka prywatności" })).toHaveAttribute("href", "/polityka-prywatnosci");
  expect(footer.getByRole("link", { name: "Regulamin" })).toHaveAttribute("href", "/regulamin");
  expect(footer.getByRole("link", { name: "Kontakt" })).toHaveAttribute("href", "mailto:kontakt@wpasuj.pl");
});

it("links the guide to agreeing a time", () => {
  render(<Footer />);

  expect(screen.getByRole("link", { name: "Jak ustalić termin" })).toHaveAttribute("href", "/jak-ustalic-termin");
});
