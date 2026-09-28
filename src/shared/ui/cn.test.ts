import { expect, it } from "vitest";
import { cn } from "./cn";

it("keeps the later of two steps from the theme's own scales", () => {
  expect(cn("tracking-tight", "tracking-tightest")).toBe("tracking-tightest");
  expect(cn("max-w-wide", "max-w-narrow")).toBe("max-w-narrow");
  expect(cn("rounded-cell", "rounded-pill")).toBe("rounded-pill");
  expect(cn("font-regular", "font-semibold")).toBe("font-semibold");
  expect(cn("ease-pop", "ease-out")).toBe("ease-out");
  expect(cn("animate-rise", "animate-none")).toBe("animate-none");
  expect(cn("shadow-lift", "shadow-sheet")).toBe("shadow-sheet");
  expect(cn("shadow-sheet", "shadow-menu")).toBe("shadow-menu");
});

it("keeps a type size beside a text colour", () => {
  expect(cn("text-sm", "text-muted")).toBe("text-sm text-muted");
});

it("drops the classes whose condition is false", () => {
  expect(cn("text-sm", false && "text-ink", "text-muted")).toBe("text-sm text-muted");
});
