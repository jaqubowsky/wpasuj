import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { beginAnalyticsVisit } from "@/shared/analytics";
import { useDevicePolls } from "@/shared/device-polls";
import { stubReducedMotion } from "@/shared/testing/motion";
import { claimName, saveAnswer } from "../server/answer-actions";
import { AnswerBody } from "./answer-body";
import { AnswerLead, AnswerStatus } from "./answer-lead";
import { AnswerProvider } from "./answer-provider";

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL = "https://analytics.example/script.js";
  process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID = "c98aed47-de54-4577-bde2-8f1133b5c5d5";
});

vi.mock("../server/answer-actions", () => ({ saveAnswer: vi.fn(), claimName: vi.fn() }));

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
const nameField = () => screen.getByRole("textbox", { name: "Twoje imię" });
const cantButton = () => screen.getByRole("button", { name: "Nie mogę w żadnym terminie" });

async function afterQuiet() {
  await act(async () => vi.advanceTimersByTime(500));
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.mocked(saveAnswer).mockResolvedValue({ ok: true, answerChange: "first" });
  localStorage.clear();
  beginAnalyticsVisit();
  stubReducedMotion(false);
});

afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

describe("answer analytics", () => {
  it.each(["changed", "unchanged"] as const)("uses the %s acknowledgement after claiming a name", async (answerChange) => {
    const track = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal("umami", { track });

    vi.mocked(saveAnswer)
      .mockResolvedValueOnce({ ok: false, reason: "name-taken", name: "Ola", hours: 1 })
      .mockResolvedValueOnce({ ok: true, answerChange });

    vi.mocked(claimName).mockResolvedValue({ ok: true, name: "Ola", slots: [{ date: "2026-10-17", hour: 21 }] });
    const { user } = renderPanel();

    await user.type(nameField(), "Ola");
    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();
    await user.click(screen.getByRole("button", { name: "Tak, to ja" }));
    await afterQuiet();

    expect(track.mock.calls).toEqual([
      [{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: "availability_started" }],
      [{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: "answer_save_failed" }],
      ...(answerChange === "changed"
        ? [[{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: "answer_changed_saved" }]]
        : []),
    ]);
  });

  it("counts queued acknowledgements once and does not count an unchanged retry", async () => {
    const track = vi.fn().mockResolvedValue(undefined);
    let acknowledge: (result: Awaited<ReturnType<typeof saveAnswer>>) => void = () => {};

    vi.stubGlobal("umami", { track });

    vi.mocked(saveAnswer)
      .mockReturnValueOnce(
        new Promise((resolve) => {
          acknowledge = resolve;
        }),
      )
      .mockResolvedValueOnce({ ok: true, answerChange: "changed" })
      .mockResolvedValueOnce({ ok: true, answerChange: "unchanged" });

    const { user, rerender } = renderPanel();

    await user.type(nameField(), "Ola");
    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();
    fireEvent.click(cell("sb 17, 20:00"));
    await afterQuiet();

    expect(track.mock.calls).toEqual([[{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: "availability_started" }]]);

    await act(async () => acknowledge({ ok: true, answerChange: "first" }));
    await afterQuiet();
    rerender(panel({ name: "Ola", slots: [] }));
    fireEvent.input(nameField(), { target: { value: "Ola " } });
    await afterQuiet();

    expect(track.mock.calls).toEqual([
      [{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: "availability_started" }],
      [{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: "answer_first_saved" }],
      [{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: "answer_changed_saved" }],
    ]);

    expect(saveAnswer).toHaveBeenCalledTimes(3);
  });

  it.each(["refused", "thrown"] as const)("counts a %s save failure without a success", async (failure) => {
    const track = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal("umami", { track });
    if (failure === "refused") vi.mocked(saveAnswer).mockResolvedValue({ ok: false, reason: "gone" });
    else vi.mocked(saveAnswer).mockRejectedValue(new TypeError("offline"));

    renderPanel({ name: "Ola", slots: [] });

    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();

    expect(track.mock.calls).toEqual([
      [{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: "availability_started" }],
      [{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: "answer_save_failed" }],
    ]);
  });

  it("counts only the acknowledged newcomer after a lost row", async () => {
    const track = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal("umami", { track });

    vi.mocked(saveAnswer)
      .mockResolvedValueOnce({ ok: false, reason: "not-yours" })
      .mockResolvedValueOnce({ ok: true, answerChange: "first" });

    renderPanel({ name: "Ola", slots: [] });

    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();

    expect(track.mock.calls).toEqual([
      [{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: "availability_started" }],
      [{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: "answer_first_saved" }],
    ]);
  });

  it.each([
    ["first", "answer_first_saved"],
    ["changed", "answer_changed_saved"],
    ["unchanged", undefined],
  ] as const)("uses the acknowledged %s save, not the returning name", async (answerChange, event) => {
    const track = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal("umami", { track });
    vi.mocked(saveAnswer).mockResolvedValue({ ok: true, answerChange });
    const { rerender } = renderPanel({ name: "Ola", slots: [] });

    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();
    rerender(panel({ name: "Ola", slots: [{ date: "2026-10-16", hour: 19 }] }));
    await afterQuiet();

    expect(track.mock.calls).toEqual([
      [{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: "availability_started" }],
      ...(event ? [[{ website: "c98aed47-de54-4577-bde2-8f1133b5c5d5", url: "/e/[id]", name: event }]] : []),
    ]);

    expect(saveAnswer).toHaveBeenCalledTimes(1);
  });
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
    expect(localStorage.getItem("last-name")).toBe("Ola");
  });

  it("keeps the answered poll on this device with its last date", async () => {
    const { user } = renderPanel();

    await user.type(nameField(), "Ola");
    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();

    expect(await screen.findByRole("status")).toHaveTextContent("Zapisane");
    expect(renderHook(() => useDevicePolls()).result.current).toEqual([{ id: pollId, role: "participant", lastDate: "2026-10-17" }]);
  });

  it("keeps nothing on this device when the answer is not saved", async () => {
    vi.mocked(saveAnswer).mockResolvedValueOnce({ ok: false, reason: "gone" });
    renderPanel({ name: "Ola", slots: [] });

    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();

    expect(await screen.findByRole("link", { name: "Zrób własną ankietę" })).toBeInTheDocument();
    expect(renderHook(() => useDevicePolls()).result.current).toEqual([]);
  });

  it("links a gone poll to a new one", async () => {
    vi.mocked(saveAnswer).mockResolvedValueOnce({ ok: false, reason: "gone" });
    renderPanel({ name: "Ola", slots: [] });

    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();

    expect(await screen.findByRole("link", { name: "Zrób własną ankietę" })).toHaveAttribute("href", "/");
  });

  it("says how to answer above the grid and offers Nie mogę under it", () => {
    renderPanel();

    const grid = screen.getByRole("grid", { name: "Kiedy możesz?" });

    expect(screen.getByText(/^Kliknij godziny, kiedy możesz\./).compareDocumentPosition(grid)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(grid.compareDocumentPosition(cantButton())).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
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

  it("Nie mogę w żadnym terminie selects the toggle, clears the hours one by one and saves an empty set", async () => {
    const { user } = renderPanel({
      name: "Ola",
      slots: [
        { date: "2026-10-16", hour: 19 },
        { date: "2026-10-17", hour: 19 },
        { date: "2026-10-16", hour: 21 },
      ],
    });

    await user.click(cantButton());

    expect(screen.getByRole("button", { name: "Nie mogę w żadnym terminie", pressed: true })).toBeInTheDocument();
    expect(screen.getAllByRole("gridcell", { selected: true })).toHaveLength(2);
    await act(async () => vi.advanceTimersByTime(120));
    expect(screen.getAllByRole("gridcell", { selected: true })).toHaveLength(1);
    await act(async () => vi.advanceTimersByTime(120));
    expect(screen.queryAllByRole("gridcell", { selected: true })).toHaveLength(0);
    await afterQuiet();
    expect(saveAnswer).toHaveBeenCalledExactlyOnceWith(pollId, { name: "Ola", slots: [] });
    expect(await screen.findByRole("status")).toHaveTextContent("Zapisane");
    expect(cantButton().compareDocumentPosition(screen.getByRole("button", { name: "Cofnij" }))).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("clears the hours at once under reduced motion", async () => {
    stubReducedMotion(true);

    const { user } = renderPanel({
      name: "Ola",
      slots: [
        { date: "2026-10-16", hour: 19 },
        { date: "2026-10-17", hour: 19 },
      ],
    });

    await user.click(cantButton());

    expect(screen.queryAllByRole("gridcell", { selected: true })).toHaveLength(0);
  });

  it("Cofnij restores and saves the hours from before", async () => {
    const before = [
      { date: "2026-10-16", hour: 19 },
      { date: "2026-10-17", hour: 20 },
    ];

    const { user } = renderPanel({ name: "Ola", slots: before });

    await user.click(cantButton());
    await afterQuiet();

    await user.click(screen.getByRole("button", { name: "Cofnij" }));
    await afterQuiet();

    expect(saveAnswer).toHaveBeenLastCalledWith(pollId, { name: "Ola", slots: before });
    expect(slot("pt 16, 19:00")).toHaveAttribute("aria-selected", "true");
    expect(slot("sb 17, 20:00")).toHaveAttribute("aria-selected", "true");
    expect(cantButton()).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("button", { name: "Cofnij" })).not.toBeInTheDocument();
  });

  it("painting an hour leaves Nie mogę and its Cofnij", async () => {
    const { user } = renderPanel({ name: "Ola", slots: [{ date: "2026-10-16", hour: 19 }] });

    await user.click(cantButton());
    await afterQuiet();

    fireEvent.click(cell("sb 17, 21:00"));
    await afterQuiet();

    expect(saveAnswer).toHaveBeenLastCalledWith(pollId, { name: "Ola", slots: [{ date: "2026-10-17", hour: 21 }] });
    expect(slot("pt 16, 19:00")).toHaveAttribute("aria-selected", "false");
    expect(cantButton()).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("button", { name: "Cofnij" })).not.toBeInTheDocument();
  });

  it("a tap turns off the toggle of an answer saved with no hours, and the next saves no hours again", async () => {
    const { user } = renderPanel({ name: "Ola", slots: [] });

    await user.click(cantButton());

    expect(cantButton()).toHaveAttribute("aria-pressed", "false");
    expect(saveAnswer).not.toHaveBeenCalled();
    await user.click(cantButton());
    await afterQuiet();
    expect(cantButton()).toHaveAttribute("aria-pressed", "true");
    expect(saveAnswer).toHaveBeenCalledExactlyOnceWith(pollId, { name: "Ola", slots: [] });
  });

  it("opens with the toggle selected for an answer saved with no hours", () => {
    renderPanel({ name: "Ola", slots: [] });

    expect(cantButton()).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("button", { name: "Cofnij" })).not.toBeInTheDocument();
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

  it("reports a save that throws to the server log", async () => {
    vi.mocked(saveAnswer).mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const sendBeacon = vi.spyOn(navigator, "sendBeacon");
    const { user } = renderPanel();

    await user.type(nameField(), "Ola");
    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();
    await screen.findByRole("button", { name: "Spróbuj ponownie" });

    expect(sendBeacon).toHaveBeenCalledExactlyOnceWith(
      "/api/failed-saves",
      JSON.stringify({ action: "saveAnswer", errorName: "TypeError" }),
    );
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
    vi.mocked(saveAnswer).mockResolvedValueOnce({ ok: false, reason: "name-taken", name: "Ola", hours: 1 });
    vi.mocked(claimName).mockResolvedValue({ ok: true, name: "Ola", slots: [{ date: "2026-10-17", hour: 21 }] });
    const { user } = renderPanel();

    await user.type(nameField(), "ola ");
    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();
    expect(await screen.findByText("To Ty, Ola?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tak, to ja" }));
    await afterQuiet();

    expect(claimName).toHaveBeenCalledWith(pollId, { name: "Ola", slots: [{ date: "2026-10-16", hour: 19 }] });
    expect(nameField()).toHaveValue("Ola");

    expect(saveAnswer).toHaveBeenLastCalledWith(pollId, {
      name: "Ola",
      slots: [
        { date: "2026-10-16", hour: 19 },
        { date: "2026-10-17", hour: 21 },
      ],
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Zapisane");
    expect(screen.queryByText("To Ty, Ola?")).not.toBeInTheDocument();
  });

  it("tells a device that answered as Bartek that Tak, to ja folds its hours into Ola", async () => {
    vi.mocked(saveAnswer).mockResolvedValueOnce({
      ok: false,
      reason: "name-taken",
      name: "Ola",
      hours: 1,
      yours: { name: "Bartek", hours: 2 },
    });

    const { user } = renderPanel();

    await user.type(nameField(), "Ola");
    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();

    const clash = await screen.findByRole("region", { name: "To Ty, Ola?" });

    expect(clash).toHaveTextContent("Twoje godziny jako Bartek dołączą do tych.");
  });

  it("keeps hours painted while Tak, to ja is on its way", async () => {
    vi.mocked(saveAnswer).mockResolvedValueOnce({ ok: false, reason: "name-taken", name: "Ola", hours: 1 });
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

  it("lets the participant pick another name on To nie ja", async () => {
    vi.mocked(saveAnswer).mockResolvedValueOnce({ ok: false, reason: "name-taken", name: "Ola", hours: 1 });
    const { user } = renderPanel();

    await user.type(nameField(), "Ola");
    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();

    await user.click(await screen.findByRole("button", { name: "To nie ja" }));

    expect(screen.queryByText("To Ty, Ola?")).not.toBeInTheDocument();
    expect(nameField()).toHaveFocus();
  });

  it("asks again as a newcomer after another device took this row over", async () => {
    vi.mocked(saveAnswer)
      .mockResolvedValueOnce({ ok: false, reason: "not-yours" })
      .mockResolvedValueOnce({ ok: false, reason: "name-taken", name: "Ola", hours: 1 });

    renderPanel({ name: "Ola", slots: [] });

    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();

    expect(await screen.findByText("To Ty, Ola?")).toBeInTheDocument();
    expect(saveAnswer).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["closed", "Termin jest już ustalony, odpowiedzi są zamknięte."],
    ["full", "W tej ankiecie jest już 30 osób, więcej się nie zmieści. Napisz na grupie, kiedy możesz."],
    ["gone", "Tej ankiety już nie ma. Zrób własną ankietę"],
  ] as const)("says what happened and what to do when the poll is %s", async (reason, copy) => {
    vi.mocked(saveAnswer).mockResolvedValueOnce({ ok: false, reason });
    renderPanel({ name: "Ola", slots: [] });

    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();

    expect((await screen.findByRole("alert")).textContent).toBe(copy);
    expect(screen.getByRole("status")).toHaveTextContent("Nie zapisano");
  });
});

describe("the invitation to make one's own poll", () => {
  const invitation = () => screen.queryByRole("link", { name: "Też coś planujesz? Zrób własną ankietę" });

  it("appears under the answer once the first save completes and links to the start", async () => {
    const { user } = renderPanel();

    await user.type(nameField(), "Ola");
    fireEvent.click(cell("pt 16, 19:00"));

    expect(invitation()).toBeNull();

    await afterQuiet();

    expect(await screen.findByRole("link", { name: "Też coś planujesz? Zrób własną ankietę" })).toHaveAttribute("href", "/");
    expect(cantButton().compareDocumentPosition(invitation()!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("greets a participant who answered before", () => {
    renderPanel({ name: "Ola", slots: [{ date: "2026-10-16", hour: 19 }] });

    expect(invitation()).toHaveAttribute("href", "/");
  });

  it("never shows to the organiser", async () => {
    render(
      <AnswerProvider pollId={pollId} dates={dates} hours={hours} fixedName="Kuba">
        <AnswerStatus />
        <AnswerLead />
        <AnswerBody />
      </AnswerProvider>,
    );

    fireEvent.click(cell("pt 16, 19:00"));
    await afterQuiet();

    expect(await screen.findByRole("status")).toHaveTextContent("Zapisane");
    expect(invitation()).toBeNull();
  });
});
