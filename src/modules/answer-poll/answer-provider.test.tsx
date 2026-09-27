import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { claimName, saveAnswer } from "./answer-actions";
import { AnswerBody } from "./answer-body";
import { AnswerLead } from "./answer-lead";
import { AnswerProvider } from "./answer-provider";

vi.mock("./answer-actions", () => ({ saveAnswer: vi.fn(), claimName: vi.fn() }));

const pollId = "Planszowki";
const dates = ["2026-10-16", "2026-10-17"];
const hours = [19, 20, 21];

type Mine = { name: string; slots: { date: string; hour: number }[] };

function panel(mine?: Mine) {
  return (
    <AnswerProvider pollId={pollId} dates={dates} hours={hours} mine={mine}>
      <AnswerLead />
      <AnswerBody />
    </AnswerProvider>
  );
}

function renderPanel(mine?: Mine) {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const view = render(panel(mine));
  return { user, ...view };
}

const cell = (name: string) => screen.getByRole("button", { name });
const slot = (name: string) => cell(name).closest("[role=gridcell]");
const nameField = () => screen.getByRole("textbox", { name: "Jak masz na imię?" });

async function afterQuiet() {
  await act(async () => vi.advanceTimersByTime(500));
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.mocked(saveAnswer).mockResolvedValue({ ok: true });
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
});

describe("the Moje lead and body", () => {
  it("saves the name and the tapped hours without a button and says so", async () => {
    const { user } = renderPanel();
    await user.type(nameField(), "Ola");

    fireEvent.click(cell("pt 16, 19:00"));
    fireEvent.click(cell("sb 17, 20:00"));
    await afterQuiet();

    expect(saveAnswer).toHaveBeenCalledExactlyOnceWith(pollId, {
      name: "Ola",
      slots: [
        { date: "2026-10-16", hour: 19 },
        { date: "2026-10-17", hour: 20 },
      ],
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Zapisane");
    expect(screen.getByText("Gotowe. Zmieniasz zdanie? Po prostu kliknij.")).toBeInTheDocument();
    expect(localStorage.getItem("last-name")).toBe("Ola");
  });

  it("links a gone poll to a new one", async () => {
    vi.mocked(saveAnswer).mockResolvedValueOnce({ ok: false, reason: "gone" });
    renderPanel({ name: "Ola", slots: [] });

    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();

    expect(await screen.findByRole("link", { name: "Zrób nową ankietę" })).toHaveAttribute("href", "/");
  });

  it("heads the grid with Kiedy możesz?", () => {
    renderPanel();

    expect(screen.getByRole("heading", { level: 2, name: "Kiedy możesz?" })).toBeInTheDocument();
  });

  it("prefills the name last used on this device", () => {
    localStorage.setItem("last-name", "Bartek");

    renderPanel();

    expect(nameField()).toHaveValue("Bartek");
  });

  it("resumes the saved answer and keeps it when newer server data arrives", async () => {
    const { rerender } = renderPanel({ name: "Ola", slots: [{ date: "2026-10-16", hour: 19 }] });
    expect(screen.getByRole("status")).toHaveTextContent("Zapisane");
    fireEvent.click(cell("sb 17, 21:00"));

    rerender(panel({ name: "Ola", slots: [{ date: "2026-10-17", hour: 20 }] }));

    expect(nameField()).toHaveValue("Ola");
    expect(slot("pt 16, 19:00")).toHaveAttribute("aria-selected", "true");
    expect(slot("sb 17, 21:00")).toHaveAttribute("aria-selected", "true");
    expect(slot("sb 17, 20:00")).toHaveAttribute("aria-selected", "false");
  });

  it("renames a saved answer when the name changes", async () => {
    const { user } = renderPanel({ name: "Ola", slots: [{ date: "2026-10-16", hour: 19 }] });

    await user.type(nameField(), "f");
    await afterQuiet();

    expect(saveAnswer).toHaveBeenLastCalledWith(pollId, { name: "Olaf", slots: [{ date: "2026-10-16", hour: 19 }] });
  });

  it("saves an empty set for Nie mogę w żadnym terminie", async () => {
    const { user } = renderPanel({ name: "Ola", slots: [{ date: "2026-10-16", hour: 19 }] });

    await user.click(screen.getByRole("button", { name: "Nie mogę w żadnym terminie" }));
    await afterQuiet();

    expect(saveAnswer).toHaveBeenLastCalledWith(pollId, { name: "Ola", slots: [] });
    expect(slot("pt 16, 19:00")).toHaveAttribute("aria-selected", "false");
    expect(await screen.findByText("Nie możesz w żadnym terminie. Zmieniasz zdanie? Po prostu kliknij.")).toBeInTheDocument();
  });

  it("shows Nie zapisano until Spróbuj ponownie succeeds", async () => {
    vi.mocked(saveAnswer).mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const { user } = renderPanel();
    await user.type(nameField(), "Ola");
    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();
    expect(await screen.findByRole("status")).toHaveTextContent("Nie zapisano");

    await user.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Zapisane");
    expect(saveAnswer).toHaveBeenCalledTimes(2);
  });

  it("asks for a name before saving hours without one", async () => {
    vi.mocked(saveAnswer).mockResolvedValueOnce({ ok: false, reason: "invalid" });
    const { user } = renderPanel();

    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();

    expect(await screen.findByText("Wpisz swoje imię, żeby zapisać")).toBeInTheDocument();
    await user.type(nameField(), "Ola");
    await afterQuiet();
    expect(saveAnswer).toHaveBeenLastCalledWith(pollId, { name: "Ola", slots: [{ date: "2026-10-16", hour: 19 }] });
  });

  it("asks To ty, Ola? with the stored name and takes the row over on Tak, to ja", async () => {
    vi.mocked(saveAnswer).mockResolvedValueOnce({ ok: false, reason: "name-taken", name: "Ola" });
    vi.mocked(claimName).mockResolvedValue({ ok: true, name: "Ola", slots: [{ date: "2026-10-17", hour: 21 }] });
    const { user } = renderPanel();
    await user.type(nameField(), "ola ");
    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();
    expect(await screen.findByText("To ty, Ola?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tak, to ja" }));
    await afterQuiet();

    expect(claimName).toHaveBeenCalledWith(pollId, "Ola");
    expect(nameField()).toHaveValue("Ola");
    expect(saveAnswer).toHaveBeenLastCalledWith(pollId, {
      name: "Ola",
      slots: [
        { date: "2026-10-16", hour: 19 },
        { date: "2026-10-17", hour: 21 },
      ],
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Zapisane");
    expect(screen.queryByText("To ty, Ola?")).not.toBeInTheDocument();
  });

  it("keeps hours painted while Tak, to ja is on its way", async () => {
    vi.mocked(saveAnswer).mockResolvedValueOnce({ ok: false, reason: "name-taken", name: "Ola" });
    let finishClaim: (result: Awaited<ReturnType<typeof claimName>>) => void = () => {};
    vi.mocked(claimName).mockReturnValue(new Promise((resolve) => (finishClaim = resolve)));
    const { user } = renderPanel();
    await user.type(nameField(), "Ola");
    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();
    await user.click(await screen.findByRole("button", { name: "Tak, to ja" }));

    fireEvent.click(cell("pt 16, 20:00"));
    await act(async () => finishClaim({ ok: true, name: "Ola", slots: [] }));
    await afterQuiet();

    expect(slot("pt 16, 20:00")).toHaveAttribute("aria-selected", "true");
    expect(saveAnswer).toHaveBeenLastCalledWith(pollId, {
      name: "Ola",
      slots: [
        { date: "2026-10-16", hour: 19 },
        { date: "2026-10-16", hour: 20 },
      ],
    });
  });

  it("keeps Nie zapisano and Spróbuj ponownie through a new stroke that fails again", async () => {
    vi.mocked(saveAnswer).mockRejectedValue(new TypeError("Failed to fetch"));
    const { user } = renderPanel();
    await user.type(nameField(), "Ola");
    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();

    fireEvent.click(cell("pt 16, 20:00"));

    expect(screen.getByRole("status")).toHaveTextContent("Nie zapisano");
    expect(screen.getByRole("button", { name: "Spróbuj ponownie" })).toBeInTheDocument();
  });

  it("lets the participant pick another name on Nie, zmienię imię", async () => {
    vi.mocked(saveAnswer).mockResolvedValueOnce({ ok: false, reason: "name-taken", name: "Ola" });
    const { user } = renderPanel();
    await user.type(nameField(), "Ola");
    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();

    await user.click(await screen.findByRole("button", { name: "Nie, zmienię imię" }));

    expect(screen.queryByText("To ty, Ola?")).not.toBeInTheDocument();
    expect(nameField()).toHaveFocus();
  });

  it("asks again as a newcomer after another device took this row over", async () => {
    vi.mocked(saveAnswer)
      .mockResolvedValueOnce({ ok: false, reason: "not-yours" })
      .mockResolvedValueOnce({ ok: false, reason: "name-taken", name: "Ola" });
    renderPanel({ name: "Ola", slots: [] });

    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();

    expect(await screen.findByText("To ty, Ola?")).toBeInTheDocument();
    expect(saveAnswer).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(/Zmieniasz zdanie\?/)).not.toBeInTheDocument();
  });

  it.each([
    ["closed", "Termin jest już ustalony, odpowiedzi są zamknięte. Zobacz go w zakładce Wszyscy."],
    ["full", "W tej ankiecie jest już 30 osób, więcej się nie zmieści. Napisz na grupie, kiedy możesz."],
    ["gone", "Tej ankiety już nie ma. Zrób nową ankietę"],
  ] as const)("says what happened and what to do when the poll is %s", async (reason, copy) => {
    vi.mocked(saveAnswer).mockResolvedValueOnce({ ok: false, reason });
    renderPanel({ name: "Ola", slots: [] });

    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();

    expect(await screen.findByRole("alert")).toHaveTextContent(copy);
    expect(screen.getByRole("status")).toHaveTextContent("Nie zapisano");
  });
});
