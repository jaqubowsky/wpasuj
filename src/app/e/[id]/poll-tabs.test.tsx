import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PollTabs } from "./poll-tabs";

const leads = { Moje: <p>imię i status</p>, Wszyscy: <p>najlepszy termin</p> };
const bodies = { Moje: <p>siatka</p>, Wszyscy: <p>mapa</p> };

describe("PollTabs", () => {
  it("puts the active tab's lead above the tabs and its body below", () => {
    render(<PollTabs opening="Moje" leads={leads} bodies={bodies} />);

    const lead = screen.getByText("imię i status");
    const tabs = screen.getByRole("tablist");
    expect(lead.compareDocumentPosition(tabs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("tabpanel", { name: "Moje" })).toHaveTextContent("siatka");
    expect(screen.queryByText("najlepszy termin")).not.toBeInTheDocument();
  });

  it("swaps the lead with the tab", async () => {
    render(<PollTabs opening="Moje" leads={leads} bodies={bodies} />);

    await userEvent.click(screen.getByRole("tab", { name: "Wszyscy" }));

    expect(screen.getByText("najlepszy termin")).toBeInTheDocument();
    expect(screen.queryByText("imię i status")).not.toBeInTheDocument();
    expect(screen.getByRole("tabpanel", { name: "Wszyscy" })).toHaveTextContent("mapa");
  });

  it("opens on the tab it is given", () => {
    render(<PollTabs opening="Wszyscy" leads={leads} bodies={bodies} />);

    expect(screen.getByRole("tab", { name: "Wszyscy", selected: true })).toBeInTheDocument();
  });
});
