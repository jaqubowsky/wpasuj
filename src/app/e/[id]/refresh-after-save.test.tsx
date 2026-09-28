import { act, fireEvent, render, screen } from "@testing-library/react";
import { AnswerBody, AnswerProvider } from "@/modules/answer-poll/client";
import { PeoplePanel, ResultsProvider } from "@/modules/view-results/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RefreshAfterSave } from "./refresh-after-save";

vi.mock("@/modules/answer-poll/server/answer-actions", () => ({ saveAnswer: vi.fn(async () => ({ ok: true })), claimName: vi.fn() }));

const pollId = "Pl4nszowki";
const olaAt = Date.parse("2030-10-15T18:00:00Z");
const olasSlot = { date: "2030-10-19", hour: 18 };
const nobody = { dates: ["2030-10-19"], hours: [18, 19], readAt: olaAt, respondents: [], final: null };
const withOla = { ...nobody, respondents: [{ name: "Ola", normalisedName: "ola", savedAt: olaAt, slots: [olasSlot] }] };
const fetchResults = vi.fn(async () => Response.json(withOla));

function renderPage(mine?: { name: string; slots: (typeof olasSlot)[] }) {
  render(
    <AnswerProvider pollId={pollId} dates={nobody.dates} hours={nobody.hours} mine={mine} fixedName="Ola">
      <ResultsProvider pollId={pollId} initial={mine ? withOla : nobody} organiserKey="kuba">
        <RefreshAfterSave />
        <PeoplePanel />
        <AnswerBody />
      </ResultsProvider>
    </AnswerProvider>,
  );
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.stubGlobal("fetch", fetchResults);
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("RefreshAfterSave", () => {
  it("shows my saved answer in the results without waiting for the next poll", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "sb 19, 18:00" }));
    await act(async () => vi.advanceTimersByTime(500));

    expect(fetchResults).toHaveBeenCalledWith(`/api/polls/${pollId}`, expect.anything());
    expect(await screen.findByRole("list", { name: "Odpowiedzieli" })).toHaveTextContent("Ola");
  });

  it("does not fetch the results again when the page opens on a saved answer", async () => {
    renderPage({ name: "Ola", slots: [olasSlot] });

    await act(async () => vi.advanceTimersByTime(500));

    expect(fetchResults).not.toHaveBeenCalled();
  });
});
