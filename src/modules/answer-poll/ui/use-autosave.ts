import { useEffect, useEffectEvent, useRef, useState } from "react";

type SaveState = "saving" | "saved" | "failed";

const quietMs = 500;

type Queue<Value> = {
  pending?: { value: Value };
  unsaved?: { value: Value };
  timer?: ReturnType<typeof setTimeout>;
  inFlight: boolean;
};

const unlessFailed = (state: SaveState | undefined) => (state === "failed" ? state : "saving");

export function useAutosave<Value>(send: (value: Value) => Promise<boolean>, initial?: "saved") {
  const [state, setState] = useState<SaveState | undefined>(initial);
  const sendRef = useRef(send);
  const queue = useRef<Queue<Value>>({ inFlight: false });

  useEffect(() => {
    sendRef.current = send;
  });

  async function flush() {
    const current = queue.current;
    clearTimeout(current.timer);
    current.timer = undefined;
    if (current.inFlight || !current.pending) return;
    const { value } = current.pending;
    current.pending = undefined;
    current.inFlight = true;
    setState(unlessFailed);

    const saved = await sendRef.current(value).catch(() => false);

    current.inFlight = false;
    current.unsaved = saved ? undefined : { value };
    if (!saved) setState("failed");
    else setState(current.pending ? "saving" : "saved");
    if (current.pending && current.timer === undefined) void flush();
  }

  const flushNow = useEffectEvent(() => void flush());

  useEffect(() => {
    const flushWhenHidden = () => {
      if (document.visibilityState === "hidden") flushNow();
    };
    document.addEventListener("visibilitychange", flushWhenHidden);
    window.addEventListener("pagehide", flushNow);
    return () => {
      document.removeEventListener("visibilitychange", flushWhenHidden);
      window.removeEventListener("pagehide", flushNow);
      flushNow();
    };
  }, []);

  return {
    state,
    schedule(value: Value) {
      const current = queue.current;
      current.pending = { value };
      setState(unlessFailed);
      clearTimeout(current.timer);
      current.timer = setTimeout(flush, quietMs);
    },
    retry() {
      const current = queue.current;
      if (current.inFlight) return;
      current.pending ??= current.unsaved;
      setState("saving");
      void flush();
    },
  };
}
