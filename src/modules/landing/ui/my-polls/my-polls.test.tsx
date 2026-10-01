import { rememberPoll } from "@/shared/device-polls";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MyPolls } from "./my-polls";

const thursdayNoon = new Date("2026-10-15T10:00:00Z");

const kino = { id: "kino-12345", title: "Kino", dates: ["2026-10-17", "2026-10-18"], respondentCount: 0, final: null };

const grill = {
  id: "grill-1234",
  title: "Grill",
  dates: ["2026-10-24"],
  respondentCount: 6,
  final: { date: "2026-10-24", firstHour: 19, lastHour: 22 },
};

const findPolls = vi.fn();

const button = () => screen.getByRole("button", { name: /^Moje ankiety/ });
const list = () => screen.getByRole("dialog", { name: "Twoje ankiety" });

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(thursdayNoon);
  localStorage.clear();
  findPolls.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Moje ankiety", () => {
  it("shows nothing on a device without polls", () => {
    render(<MyPolls findPolls={findPolls} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("counts the polls this device holds, leaving out one 61 days past its last date", () => {
    rememberPoll({ id: kino.id, role: "organiser", lastDate: "2026-10-18" });
    rememberPoll({ id: grill.id, role: "participant", lastDate: "2026-10-24" });
    rememberPoll({ id: "old-123456", role: "participant", lastDate: "2026-08-15" });

    render(<MyPolls findPolls={findPolls} />);

    expect(button()).toHaveAccessibleName("Moje ankiety, 2");
    expect(button()).toHaveTextContent("Moje ankiety2");
  });

  it("asks the server only for the polls it lists and shows them newest first, each a link with role, dates and status", async () => {
    rememberPoll({ id: kino.id, role: "organiser", lastDate: "2026-10-18" });
    rememberPoll({ id: grill.id, role: "participant", lastDate: "2026-10-24" });
    rememberPoll({ id: "old-123456", role: "participant", lastDate: "2026-08-15" });
    let answer: (found: unknown) => void = () => {};

    findPolls.mockReturnValue(new Promise((resolve) => (answer = resolve)));
    render(<MyPolls findPolls={findPolls} />);

    await userEvent.click(button());

    expect(within(list()).getByRole("heading", { name: "Twoje ankiety" })).toBeInTheDocument();
    expect(within(list()).getByText("Wczytuję")).toBeInTheDocument();
    expect(findPolls).toHaveBeenCalledExactlyOnceWith([grill.id, kino.id]);
    answer({ ok: true, polls: [grill, kino] });

    const rows = await within(list()).findAllByRole("link");

    expect(rows.map((row) => row.getAttribute("href"))).toEqual([`/e/${grill.id}`, `/e/${kino.id}`]);
    expect(rows[0]).toHaveTextContent("GrillOdpowiadasz · sb 24.10Ustalone: sobota 24.10, 19–22");
    expect(rows[1]).toHaveTextContent("KinoTwoja ankieta · sb 17.10 – nd 18.10Nikt jeszcze nie odpowiedział");
    expect(within(list()).queryByText("Wczytuję")).not.toBeInTheDocument();
  });

  it("says where the list lives", async () => {
    rememberPoll({ id: kino.id, role: "organiser", lastDate: "2026-10-18" });
    findPolls.mockResolvedValue({ ok: true, polls: [kino] });
    render(<MyPolls findPolls={findPolls} />);

    await userEvent.click(button());

    expect(within(list()).getByText("Widać je tylko na tym telefonie.")).toBeInTheDocument();
    expect(within(list()).getByText("Widać je tylko w tej przeglądarce.")).toBeInTheDocument();
  });

  it("forgets a poll the server no longer has, in the list and in the count", async () => {
    rememberPoll({ id: kino.id, role: "organiser", lastDate: "2026-10-18" });
    rememberPoll({ id: grill.id, role: "participant", lastDate: "2026-10-24" });
    findPolls.mockResolvedValue({ ok: true, polls: [kino] });
    render(<MyPolls findPolls={findPolls} />);

    await userEvent.click(button());

    expect(await within(list()).findAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Moje ankiety, 1", hidden: true })).toBeInTheDocument();
  });

  it("says the polls are gone when none is left, and drops the button once closed", async () => {
    rememberPoll({ id: kino.id, role: "organiser", lastDate: "2026-10-18" });
    findPolls.mockResolvedValue({ ok: true, polls: [] });
    render(<MyPolls findPolls={findPolls} />);

    await userEvent.click(button());
    expect(await within(list()).findByText("Tych ankiet już nie ma.")).toBeInTheDocument();
    await userEvent.click(within(list()).getByRole("button", { name: "Zamknij" }));

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("says the list did not load and loads it again on Spróbuj ponownie", async () => {
    rememberPoll({ id: kino.id, role: "organiser", lastDate: "2026-10-18" });
    findPolls.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ ok: true, polls: [kino] });
    render(<MyPolls findPolls={findPolls} />);

    await userEvent.click(button());
    expect(await within(list()).findByText("Nie udało się wczytać ankiet.")).toBeInTheDocument();
    await userEvent.click(within(list()).getByRole("button", { name: "Spróbuj ponownie" }));

    expect(await within(list()).findByRole("link", { name: /Kino/ })).toBeInTheDocument();
    expect(within(list()).queryByText("Nie udało się wczytać ankiet.")).not.toBeInTheDocument();
  });

  it("says the list did not load when the server refuses the request", async () => {
    rememberPoll({ id: kino.id, role: "organiser", lastDate: "2026-10-18" });
    findPolls.mockResolvedValue({ ok: false, reason: "invalid" });
    render(<MyPolls findPolls={findPolls} />);

    await userEvent.click(button());

    expect(await within(list()).findByText("Nie udało się wczytać ankiet.")).toBeInTheDocument();
  });

  it("closes on Zamknij and puts focus back on the button", async () => {
    rememberPoll({ id: kino.id, role: "organiser", lastDate: "2026-10-18" });
    findPolls.mockResolvedValue({ ok: true, polls: [kino] });
    render(<MyPolls findPolls={findPolls} />);

    await userEvent.click(button());
    await within(list()).findByRole("link");
    await userEvent.click(within(list()).getByRole("button", { name: "Zamknij" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(button()).toHaveFocus();
  });
});
