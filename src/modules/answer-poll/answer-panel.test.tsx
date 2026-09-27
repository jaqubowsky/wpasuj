import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { claimName, saveAnswer } from "./answer-actions";
import { AnswerPanel } from "./answer-panel";

vi.mock("./answer-actions", () => ({ saveAnswer: vi.fn(), claimName: vi.fn() }));

const pollId = "Planszowki";
const dates = ["2026-10-16", "2026-10-17"];
const hours = [19, 20, 21];

function renderPanel(mine?: { name: string; slots: { date: string; hour: number }[] }) {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const view = render(<AnswerPanel pollId={pollId} dates={dates} hours={hours} mine={mine} />);
  return { user, ...view };
}

const cell = (name: string) => screen.getByRole("button", { name });
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

describe("AnswerPanel", () => {
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

  it("prefills the name last used on this device", () => {
    localStorage.setItem("last-name", "Bartek");

    renderPanel();

    expect(nameField()).toHaveValue("Bartek");
  });

  it("resumes the saved answer and keeps it when newer server data arrives", async () => {
    const { rerender } = renderPanel({ name: "Ola", slots: [{ date: "2026-10-16", hour: 19 }] });
    expect(screen.getByRole("status")).toHaveTextContent("Zapisane");
    fireEvent.click(cell("sb 17, 21:00"));

    rerender(<AnswerPanel pollId={pollId} dates={dates} hours={hours} mine={{ name: "Ola", slots: [{ date: "2026-10-17", hour: 20 }] }} />);

    expect(nameField()).toHaveValue("Ola");
    expect(cell("pt 16, 19:00")).toHaveAttribute("aria-pressed", "true");
    expect(cell("sb 17, 21:00")).toHaveAttribute("aria-pressed", "true");
    expect(cell("sb 17, 20:00")).toHaveAttribute("aria-pressed", "false");
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
    expect(cell("pt 16, 19:00")).toHaveAttribute("aria-pressed", "false");
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

  it("asks To ty, Ola? for a taken name and takes the row over on Tak, to ja", async () => {
    vi.mocked(saveAnswer).mockResolvedValueOnce({ ok: false, reason: "name-taken" });
    vi.mocked(claimName).mockResolvedValue({ ok: true, slots: [{ date: "2026-10-17", hour: 21 }] });
    const { user } = renderPanel();
    await user.type(nameField(), "Ola");
    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();
    expect(await screen.findByText("To ty, Ola?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tak, to ja" }));
    await afterQuiet();

    expect(claimName).toHaveBeenCalledWith(pollId, "Ola");
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

  it("lets the participant pick another name on Nie, zmienię imię", async () => {
    vi.mocked(saveAnswer).mockResolvedValueOnce({ ok: false, reason: "name-taken" });
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
      .mockResolvedValueOnce({ ok: false, reason: "name-taken" });
    renderPanel({ name: "Ola", slots: [] });

    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();

    expect(await screen.findByText("To ty, Ola?")).toBeInTheDocument();
    expect(saveAnswer).toHaveBeenCalledTimes(2);
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
