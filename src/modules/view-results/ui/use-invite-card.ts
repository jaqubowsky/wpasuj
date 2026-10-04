import { trackAnalyticsEvent } from "@/shared/analytics";
import { forgetFreshPoll, isFreshPoll } from "@/shared/fresh-poll";
import { shareOrCopy } from "@/shared/share-link";
import { useEffect, useRef, useState } from "react";
import { reminderText } from "../domain/reminder-text";
import { copiedMs } from "./copied";

type Stage = "closed" | "open" | "sent";
type Copied = { from: "send" | "link"; outcome: "copied" | "not-copied" };

export function useInviteCard(pollId: string, title: string) {
  const [stage, setStage] = useState<Stage>(() => (typeof window !== "undefined" && isFreshPoll(pollId) ? "open" : "closed"));
  const [copied, setCopied] = useState<Copied>();
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const link = () => `${location.origin}/e/${pollId}`;

  useEffect(() => forgetFreshPoll(pollId), [pollId]);

  function showCopied(copied: Copied) {
    clearTimeout(copiedTimer.current);
    setCopied(copied);
    if (copied.outcome === "copied") copiedTimer.current = setTimeout(() => setCopied(undefined), copiedMs);
  }

  async function send() {
    trackAnalyticsEvent("invite_share_clicked", "/e/[id]");
    const invite = reminderText([], { title, link: link() });
    const outcome = await shareOrCopy({ text: invite, link: invite });

    switch (outcome) {
      case "shared":
        return setStage("sent");
      case "copied":
        trackAnalyticsEvent("invite_copied", "/e/[id]");

        return showCopied({ from: "send", outcome });
      case "not-copied":
        return showCopied({ from: "send", outcome });
      case "cancelled":
        return;
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link());
      trackAnalyticsEvent("invite_copied", "/e/[id]");
      showCopied({ from: "link", outcome: "copied" });
    } catch {
      showCopied({ from: "link", outcome: "not-copied" });
    }
  }

  return {
    stage,
    copiedBy: (from: Copied["from"]) => copied?.from === from && copied.outcome === "copied",
    notCopiedBy: copied?.outcome === "not-copied" ? copied.from : undefined,
    shownLink: () => `${location.host}/e/${pollId}`,
    send,
    copyLink,
  };
}
