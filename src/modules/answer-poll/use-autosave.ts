import { useEffect, useRef, useState } from "react";

type SaveState = "idle" | "saving" | "saved" | "failed";

const quietMs = 500;

type Queue<Value> = {
  pending?: { value: Value };
  unsaved?: { value: Value };
  timer?: ReturnType<typeof setTimeout>;
  inFlight: boolean;
};

export function useAutosave<Value>(send: (value: Value) => Promise<boolean>, initial: SaveState = "idle") {
  const [state, setState] = useState(initial);
  const sendRef = useRef(send);
  const queue = useRef<Queue<Value>>({ inFlight: false });

  useEffect(() => {
    sendRef.current = send;
  });

  useEffect(() => () => clearTimeout(queue.current.timer), []);

  async function flush() {
    const current = queue.current;
    current.timer = undefined;
    if (current.inFlight || !current.pending) return;
    const { value } = current.pending;
    current.pending = undefined;
    current.inFlight = true;
    setState("saving");

    const saved = await sendRef.current(value).catch(() => false);

    current.inFlight = false;
    current.unsaved = saved ? undefined : { value };
    if (current.pending && current.timer === undefined) {
      void flush();
      return;
    }
    if (!current.pending) setState(saved ? "saved" : "failed");
  }

  return {
    state,
    schedule(value: Value) {
      const current = queue.current;
      current.pending = { value };
      setState("saving");
      clearTimeout(current.timer);
      current.timer = setTimeout(flush, quietMs);
    },
    retry() {
      const current = queue.current;
      current.pending ??= current.unsaved;
      clearTimeout(current.timer);
      void flush();
    },
  };
}
