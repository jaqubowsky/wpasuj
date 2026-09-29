import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { expect, it } from "vitest";
import { Icon } from "./icon";

const drawn = (element: ReactElement) => render(element).container.querySelector("svg")!;

it("draws a named icon at 18px with a 1.5 stroke in the text colour, hidden from assistive technology", () => {
  const icon = drawn(<Icon name="check" />);

  expect(icon).toHaveAttribute("aria-hidden", "true");
  expect(icon).toHaveAttribute("width", "18");
  expect(icon).toHaveAttribute("height", "18");
  expect(icon).toHaveAttribute("stroke", "currentColor");
  expect(icon).toHaveAttribute("stroke-width", "1.5");
  expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
  expect(icon.querySelector("path")).toHaveAttribute("d", "M20 6 9 17l-5-5");
});

it("takes a size and a heavier stroke from its scale", () => {
  const icon = drawn(<Icon name="check" size={14} stroke={2.5} />);

  expect(icon).toHaveAttribute("width", "14");
  expect(icon).toHaveAttribute("height", "14");
  expect(icon).toHaveAttribute("stroke-width", "2.5");
});

it("keeps a drawing on its own grid", () => {
  const icon = drawn(<Icon name="check-status" size={16} />);

  expect(icon).toHaveAttribute("viewBox", "0 0 16 16");
  expect(icon.querySelector("path")).toHaveAttribute("d", "M3.5 8.5l3 3 6-7");
});
