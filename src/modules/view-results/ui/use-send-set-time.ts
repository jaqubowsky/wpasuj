import { shareOrCopy } from "@/shared/share-link";
import { useState } from "react";
import type { FinalTime } from "../server/results-schema";
import { setTimeMessage } from "../domain/set-time";

export function useSendSetTime(pollId: string, title: string, final: FinalTime) {
  const [notice, setNotice] = useState<"copied" | "not-copied">();

  async function send() {
    const message = setTimeMessage(final, { title, link: `${location.origin}/e/${pollId}` });
    const outcome = await shareOrCopy({ text: message, link: message });

    setNotice(outcome === "copied" || outcome === "not-copied" ? outcome : undefined);
  }

  return { notice, send };
}
