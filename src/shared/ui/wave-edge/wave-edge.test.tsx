import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import { WaveEdge } from "./wave-edge";

it("draws one wavy edge across the full width, hidden from assistive technology", () => {
  const { container } = render(<WaveEdge tone="ink" side="top" />);
  const edge = container.querySelector("svg")!;

  expect(edge).toHaveAttribute("aria-hidden", "true");
  expect(edge).toHaveAttribute("viewBox", "0 0 1440 28");
  expect(edge.querySelector("path")!.getAttribute("d")).toMatch(/^M0 28 L0 14 Q 20 0 40 14 T 80 14 .* T 1440 14 L1440 28 Z$/);
});
