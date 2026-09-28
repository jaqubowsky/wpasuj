import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAutosave } from "./use-autosave";

function deferredSends() {
  const pending: { value: string; settle: (saved: boolean) => void }[] = [];

  const send = vi.fn(
    (value: string) =>
      new Promise<boolean>((resolve) => {
        pending.push({ value, settle: resolve });
      }),
  );

  return { send, pending };
}

async function settle(sends: ReturnType<typeof deferredSends>, index: number, saved: boolean) {
  await act(async () => sends.pending[index].settle(saved));
}

async function wait(ms: number) {
  await act(async () => vi.advanceTimersByTime(ms));
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useAutosave", () => {
  it("sends 500 ms after the last stroke and reports saving, then saved", async () => {
    const sends = deferredSends();
    const { result } = renderHook(() => useAutosave(sends.send));

    act(() => result.current.schedule("a"));
    await wait(499);
    expect(sends.send).not.toHaveBeenCalled();
    await wait(1);

    expect(sends.send).toHaveBeenCalledExactlyOnceWith("a");
    expect(result.current.state).toBe("saving");
    await settle(sends, 0, true);
    expect(result.current.state).toBe("saved");
  });

  it("sends only the newest set when strokes follow each other quickly", async () => {
    const sends = deferredSends();
    const { result } = renderHook(() => useAutosave(sends.send));

    act(() => result.current.schedule("a"));
    await wait(300);
    act(() => result.current.schedule("b"));
    await wait(500);

    expect(sends.send).toHaveBeenCalledExactlyOnceWith("b");
  });

  it("keeps one save in flight and sends the newest pending set after it", async () => {
    const sends = deferredSends();
    const { result } = renderHook(() => useAutosave(sends.send));

    act(() => result.current.schedule("a"));
    await wait(500);

    act(() => result.current.schedule("b"));
    await wait(500);
    act(() => result.current.schedule("c"));
    await wait(500);
    expect(sends.send).toHaveBeenCalledTimes(1);
    await settle(sends, 0, true);

    expect(sends.send).toHaveBeenLastCalledWith("c");
    expect(sends.send).toHaveBeenCalledTimes(2);
    expect(result.current.state).toBe("saving");
    await settle(sends, 1, true);
    expect(result.current.state).toBe("saved");
  });

  it("still says saving when a save lands while a newer stroke waits", async () => {
    const sends = deferredSends();
    const { result } = renderHook(() => useAutosave(sends.send));

    act(() => result.current.schedule("a"));
    await wait(500);
    act(() => result.current.schedule("b"));

    await settle(sends, 0, true);

    expect(result.current.state).toBe("saving");
  });

  it("stays failed until a retry succeeds", async () => {
    const sends = deferredSends();
    const { result } = renderHook(() => useAutosave(sends.send));

    act(() => result.current.schedule("a"));
    await wait(500);

    await settle(sends, 0, false);
    expect(result.current.state).toBe("failed");
    await wait(10_000);
    expect(result.current.state).toBe("failed");

    act(() => result.current.retry());
    expect(sends.send).toHaveBeenLastCalledWith("a");
    await settle(sends, 1, true);
    expect(result.current.state).toBe("saved");
  });

  it("says saving at once on a retry, and a second tap while it runs sends nothing more", async () => {
    const sends = deferredSends();
    const { result } = renderHook(() => useAutosave(sends.send));

    act(() => result.current.schedule("a"));
    await wait(500);
    await settle(sends, 0, false);

    act(() => result.current.retry());
    expect(result.current.state).toBe("saving");
    act(() => result.current.retry());
    await settle(sends, 1, true);
    await wait(10_000);

    expect(sends.send).toHaveBeenCalledTimes(2);
    expect(result.current.state).toBe("saved");
  });

  it("says saving on a retry tapped while a newer set is already on its way", async () => {
    const sends = deferredSends();
    const { result } = renderHook(() => useAutosave(sends.send));

    act(() => result.current.schedule("a"));
    await wait(500);
    await settle(sends, 0, false);
    act(() => result.current.schedule("b"));
    await wait(500);

    act(() => result.current.retry());

    expect(result.current.state).toBe("saving");
    await settle(sends, 1, true);
    expect(sends.send).toHaveBeenCalledTimes(2);
    expect(result.current.state).toBe("saved");
  });

  it("keeps saying failed through new strokes until a save succeeds", async () => {
    const sends = deferredSends();
    const { result } = renderHook(() => useAutosave(sends.send));

    act(() => result.current.schedule("a"));
    await wait(500);
    await settle(sends, 0, false);

    act(() => result.current.schedule("b"));
    expect(result.current.state).toBe("failed");
    await wait(500);
    expect(sends.send).toHaveBeenLastCalledWith("b");
    expect(result.current.state).toBe("failed");
    await settle(sends, 1, true);

    expect(result.current.state).toBe("saved");
  });

  it("sends a pending set at once when the page is hidden", async () => {
    const sends = deferredSends();
    const { result } = renderHook(() => useAutosave(sends.send));

    act(() => result.current.schedule("a"));
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(sends.send).toHaveBeenCalledExactlyOnceWith("a");
  });

  it("leaves a visible page's pending set to its quiet time", async () => {
    const sends = deferredSends();
    const { result } = renderHook(() => useAutosave(sends.send));

    act(() => result.current.schedule("a"));

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(sends.send).not.toHaveBeenCalled();
  });

  it("sends a pending set at once when the page is left", async () => {
    const sends = deferredSends();
    const { result } = renderHook(() => useAutosave(sends.send));

    act(() => result.current.schedule("a"));

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });

    expect(sends.send).toHaveBeenCalledExactlyOnceWith("a");
  });

  it("sends a pending set at once when it unmounts", async () => {
    const sends = deferredSends();
    const { result, unmount } = renderHook(() => useAutosave(sends.send));

    act(() => result.current.schedule("a"));

    unmount();

    expect(sends.send).toHaveBeenCalledExactlyOnceWith("a");
  });

  it("treats a send that throws, such as a dropped connection, as not saved", async () => {
    const send = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });

    const { result } = renderHook(() => useAutosave(send));

    act(() => result.current.schedule("a"));
    await wait(500);

    expect(result.current.state).toBe("failed");
  });

  it("says saving from the stroke on, so a saved answer never claims an unsent change", async () => {
    const sends = deferredSends();
    const { result } = renderHook(() => useAutosave(sends.send, "saved"));

    act(() => result.current.schedule("a"));

    expect(result.current.state).toBe("saving");
  });

  it("starts from the state it is given", () => {
    const { result } = renderHook(() => useAutosave(vi.fn(), "saved"));

    expect(result.current.state).toBe("saved");
  });
});
