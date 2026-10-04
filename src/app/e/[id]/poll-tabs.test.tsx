import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import userEvent from "@testing-library/user-event";
import { PeoplePanel, ResultsBody, ResultsProvider } from "@/modules/view-results/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PollTabs } from "./poll-tabs";

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL = "https://analytics.example/script.js";
  process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID = "c98aed47-de54-4577-bde2-8f1133b5c5d5";
});

afterEach(() => vi.unstubAllGlobals());

const leads = { Moje: <p>imię i status</p>, Wszyscy: <p>najlepszy termin</p> };
const bodies = { Moje: <p>siatka</p>, Wszyscy: <p>mapa</p> };

const results = {
  dates: ["2030-10-19"],
  hours: [18, 19],
  readAt: Date.parse("2030-10-15T18:00:00Z"),
  respondents: [
    { name: "Ola", normalisedName: "ola", savedAt: Date.parse("2030-10-15T18:00:00Z"), slots: [{ date: "2030-10-19", hour: 18 }] },
  ],
  final: null,
};

function renderTabs(tabs: ReactNode) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json(results)),
  );

  render(
    <ResultsProvider pollId="Pl4nszowki" initial={results} organiserKey="kuba">
      <PeoplePanel />
      {tabs}
    </ResultsProvider>,
  );
}

describe("PollTabs", () => {
  it("counts only explicitly opening results, not renders or an already open tab", async () => {
    const track = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal("umami", { track });
    renderTabs(<PollTabs opening="Wszyscy" leads={leads} bodies={bodies} />);

    await userEvent.click(screen.getByRole("tab", { name: "Wszyscy" }));

    expect(track).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("tab", { name: "Moje" }));
    await userEvent.click(screen.getByRole("tab", { name: "Wszyscy" }));
    await userEvent.click(screen.getByRole("tab", { name: "Wszyscy" }));

    expect(track).toHaveBeenCalledExactlyOnceWith({
      website: "c98aed47-de54-4577-bde2-8f1133b5c5d5",
      url: "/e/[id]",
      name: "results_opened",
    });
  });

  it("puts the active tab's lead above the tabs and its body below", () => {
    renderTabs(<PollTabs opening="Moje" leads={leads} bodies={bodies} />);

    const lead = screen.getByText("imię i status");
    const tabs = screen.getByRole("tablist");

    expect(lead.compareDocumentPosition(tabs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("tabpanel", { name: "Moje" })).toHaveTextContent("siatka");
    expect(screen.queryByText("najlepszy termin")).not.toBeInTheDocument();
  });

  it("swaps the lead with the tab", async () => {
    renderTabs(<PollTabs opening="Moje" leads={leads} bodies={bodies} />);

    await userEvent.click(screen.getByRole("tab", { name: "Wszyscy" }));

    expect(screen.getByText("najlepszy termin")).toBeInTheDocument();
    expect(screen.queryByText("imię i status")).not.toBeInTheDocument();
    expect(screen.getByRole("tabpanel", { name: "Wszyscy" })).toHaveTextContent("mapa");
  });

  it("opens on the tab it is given", () => {
    renderTabs(<PollTabs opening="Wszyscy" leads={leads} bodies={bodies} />);

    expect(screen.getByRole("tab", { name: "Wszyscy", selected: true })).toBeInTheDocument();
  });
});

describe("PollTabs with the results", () => {
  it("forgets a tapped hour once Moje is open, so the side panel lists who answered", async () => {
    renderTabs(<PollTabs opening="Wszyscy" leads={{}} bodies={{ Moje: <p>siatka</p>, Wszyscy: <ResultsBody /> }} />);
    await userEvent.click(screen.getByRole("button", { name: "sb 19, 18:00, 1 z 1 może" }));
    expect(screen.getAllByRole("region", { name: "Sobota 19.10, 18:00" }).length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole("tab", { name: "Moje" }));

    expect(screen.queryByRole("region", { name: "Sobota 19.10, 18:00" })).not.toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Odpowiedzieli" })).toBeInTheDocument();
  });
});
