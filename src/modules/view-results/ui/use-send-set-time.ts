import { shareOrCopy } from "@/shared/share-link";
import { useRef, useState } from "react";
import type { FinalTime } from "../server/results-schema";
import { setTimeMessage } from "../domain/set-time";
import { copiedMs } from "./copied";

export function useSendSetTime(pollId: string, title: string, final: FinalTime) {
  const [outcome, setOutcome] = useState<"copied" | "not-copied">();
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function send() {
    const message = setTimeMessage(final, { title, link: `${location.origin}/e/${pollId}` });
    const sent = await shareOrCopy({ text: message, link: message });

    clearTimeout(copiedTimer.current);
    setOutcome(sent === "copied" || sent === "not-copied" ? sent : undefined);
    if (sent === "copied") copiedTimer.current = setTimeout(() => setOutcome(undefined), copiedMs);
  }

  return { copied: outcome === "copied", notCopied: outcome === "not-copied", send };
}
