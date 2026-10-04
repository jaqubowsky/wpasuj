import Link from "next/link";
import { StrictMode } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const route = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL = "https://analytics.example/script.js";
  process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID = "c98aed47-de54-4577-bde2-8f1133b5c5d5";

  process.env.NEXT_PUBLIC_UMAMI_ATTRIBUTION = JSON.stringify({
    utm_source: ["newsletter"],
    utm_campaign: ["launch"],
    referrerHosts: ["google.com"],
  });

  return { pathname: "/" };
});

vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

import { beginAnalyticsVisit, trackAnalyticsEvent } from "@/shared/analytics";
import { Analytics } from "./analytics";

const script = () => document.querySelector<HTMLScriptElement>('script[src="https://analytics.example/script.js"]');

beforeEach(() => beginAnalyticsVisit());

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  route.pathname = "/";
  window.history.replaceState(null, "", "/");
  Object.defineProperty(document, "referrer", { configurable: true, value: "" });
});

describe("public analytics", () => {
  it("loads a manual tracker and sends only approved attribution", async () => {
    window.history.replaceState(null, "", "/?utm_source=newsletter&utm_campaign=launch&token=secret&title=Kino#private");
    Object.defineProperty(document, "referrer", { configurable: true, value: "https://google.com/search?token=secret#private" });
    render(<Analytics />);
    const track = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal("umami", { track });
    await act(() => script()!.dispatchEvent(new Event("load")));

    expect(script()).toHaveAttribute("data-auto-track", "false");
    expect(script()).toHaveAttribute("crossorigin", "anonymous");
    expect(script()!.referrerPolicy).toBe("no-referrer");

    expect(track).toHaveBeenCalledExactlyOnceWith({
      website: "c98aed47-de54-4577-bde2-8f1133b5c5d5",
      url: "/?utm_source=newsletter&utm_campaign=launch",
      referrer: "https://google.com/",
    });
  });

  it("drops unapproved campaign labels and a poll referrer", async () => {
    window.history.replaceState(null, "", "/?utm_source=Kuba&utm_campaign=abcdefghij&organiser=secret");
    Object.defineProperty(document, "referrer", { configurable: true, value: "https://wpasuj.example/e/abcdefghij/organizator/secret" });
    const track = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal("umami", { track });
    render(<Analytics />);

    expect(track).toHaveBeenCalledExactlyOnceWith({ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/" });
    expect(script()).toBeNull();
  });

  it.each(["/e/abcdefghij/organizator/secret", "/dev/components", "/missing"])("does not track %s", (pathname) => {
    route.pathname = pathname;
    const track = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal("umami", { track });
    render(<Analytics />);

    expect(track).not.toHaveBeenCalled();
    expect(script()).toBeNull();
  });

  it("records poll entry without the page defaults", () => {
    route.pathname = "/e/abcdefghij";
    window.history.replaceState(null, "", "/e/abcdefghij?organiser=secret&utm_source=linkedin#private");
    Object.defineProperty(document, "referrer", { configurable: true, value: "https://google.com/e/private?token=secret" });
    document.title = "Private title";
    const track = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal("umami", { track });
    render(<Analytics />);

    expect(track).toHaveBeenCalledExactlyOnceWith({
      website: "c98aed47-de54-4577-bde2-8f1133b5c5d5",
      url: "/e/[id]",
      name: "poll_entered",
    });
  });

  it.each([
    ["https://google.com/e/private-id?token=private-token#private-fragment", "https://google.com/"],
    ["https://unapproved.example/e/private-id?token=private-token", undefined],
    [`${window.location.origin}/e/private-id/organizator/private-token`, undefined],
  ])("keeps only the approved original document source on poll-to-public navigation, %s", (referrer, approved) => {
    route.pathname = "/e/abcdefghij";
    Object.defineProperty(document, "referrer", { configurable: true, value: referrer });
    const track = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal("umami", { track });
    const { rerender } = render(<Analytics />);

    route.pathname = "/jak-ustalic-termin";
    window.history.replaceState(null, "", "/jak-ustalic-termin?token=private-token#private-fragment");
    rerender(<Analytics />);

    expect(track.mock.calls).toEqual([
      [{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: "poll_entered" }],
      [
        approved
          ? { website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/jak-ustalic-termin", referrer: "https://google.com/" }
          : { website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/jak-ustalic-termin" },
      ],
    ]);
  });

  it("sends a public pageview once across effect replay and remounts", () => {
    const track = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal("umami", { track });

    const first = render(
      <StrictMode>
        <Analytics />
      </StrictMode>,
    );

    first.unmount();
    render(<Analytics />);

    expect(track).toHaveBeenCalledExactlyOnceWith({ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/" });
  });

  it("keeps poll entry and first availability interaction once across root remounts", () => {
    route.pathname = "/e/abcdefghij";
    const track = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal("umami", { track });
    const first = render(<Analytics />);

    trackAnalyticsEvent("availability_started", "/e/[id]");
    first.unmount();
    render(<Analytics />);
    trackAnalyticsEvent("availability_started", "/e/[id]");

    expect(track.mock.calls).toEqual([
      [{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: "poll_entered" }],
      [{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: "availability_started" }],
    ]);
  });

  it("starts a new visit after another route, including an untracked route", () => {
    route.pathname = "/e/abcdefghij";
    const track = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal("umami", { track });
    const { rerender } = render(<Analytics />);

    trackAnalyticsEvent("availability_started", "/e/[id]");
    route.pathname = "/missing";
    rerender(<Analytics />);
    route.pathname = "/e/abcdefghij";
    rerender(<Analytics />);
    trackAnalyticsEvent("availability_started", "/e/[id]");

    expect(track.mock.calls).toEqual([
      [{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: "poll_entered" }],
      [{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: "availability_started" }],
      [{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: "poll_entered" }],
      [{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: "availability_started" }],
    ]);
  });

  it("records invitation clicks without the link or the poll data", () => {
    route.pathname = "/e/abcdefghij";
    const track = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal("umami", { track });

    render(
      <>
        <Analytics />
        <div data-answer-invite>
          <Link href="/?from=participant&private=secret">
            <span>Create your poll</span>
          </Link>
        </div>
      </>,
    );

    track.mockClear();

    screen.getByText("Create your poll").click();

    expect(track).toHaveBeenCalledExactlyOnceWith({
      website: "c98aed47-de54-4577-bde2-8f1133b5c5d5",
      url: "/e/[id]",
      name: "own_poll_clicked",
    });
  });

  it.each(["/jak-ustalic-termin", "/regulamin", "/polityka-prywatnosci"])("recognizes %s centrally", (pathname) => {
    route.pathname = pathname;
    const track = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal("umami", { track });
    render(<Analytics />);

    expect(track).toHaveBeenCalledExactlyOnceWith({ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: pathname });
  });

  it("discards a pageview when the script loads after leaving the public page", async () => {
    const { rerender } = render(<Analytics />);
    const pending = script()!;
    const track = vi.fn().mockResolvedValue(undefined);

    route.pathname = "/e/abcdefghij";
    rerender(<Analytics />);
    vi.stubGlobal("umami", { track });
    await act(() => pending.dispatchEvent(new Event("load")));

    expect(track).not.toHaveBeenCalled();
    expect(script()).not.toBe(pending);
    expect(script()).toHaveAttribute("data-auto-track", "false");
    await act(() => script()!.dispatchEvent(new Event("load")));

    expect(track).toHaveBeenCalledExactlyOnceWith({
      website: "c98aed47-de54-4577-bde2-8f1133b5c5d5",
      url: "/e/[id]",
      name: "poll_entered",
    });
  });
});
