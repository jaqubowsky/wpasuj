import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ZoneNote } from "./zone-note";

function viewerIn(timeZone: string) {
  vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({ timeZone } as Intl.ResolvedDateTimeFormatOptions);
}

afterEach(() => {
  vi.restoreAllMocks();
});

it("names the poll's zone when the viewer is in another one", () => {
  viewerIn("Europe/London");

  render(<ZoneNote pollZone="Europe/Warsaw" />);

  expect(screen.getByText("Godziny w strefie Europe/Warsaw")).toBeInTheDocument();
});

it("says nothing when the viewer is in the poll's zone", () => {
  viewerIn("Europe/Warsaw");

  const { container } = render(<ZoneNote pollZone="Europe/Warsaw" />);

  expect(container).toBeEmptyDOMElement();
});
