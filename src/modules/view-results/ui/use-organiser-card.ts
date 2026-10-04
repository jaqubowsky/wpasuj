import { trackAnalyticsEvent } from "@/shared/analytics";
import { shareOrCopy } from "@/shared/share-link";
import { useState } from "react";
import { reminderText } from "../domain/reminder-text";

export type CardNotice = "reminder-copied" | "link-copied" | "organiser-link-copied" | "not-copied";

type CardInput = { pollId: string; title: string; token: string; respondentNames: string[] };

export function useOrganiserCard({ pollId, title, token, respondentNames }: CardInput) {
  const [menu, setMenu] = useState<"more" | "delete">();
  const [notice, setNotice] = useState<CardNotice>();
  const pollLink = () => `${location.origin}/e/${pollId}`;

  async function copy(text: string, copied: CardNotice) {
    setMenu(undefined);

    try {
      await navigator.clipboard.writeText(text);
      if (copied === "link-copied") trackAnalyticsEvent("invite_copied", "/e/[id]");

      setNotice(copied);
    } catch {
      setNotice("not-copied");
    }
  }

  async function remind() {
    trackAnalyticsEvent("invite_share_clicked", "/e/[id]");
    const message = reminderText(respondentNames, { title, link: pollLink() });
    const outcome = await shareOrCopy({ text: message, link: message });

    if (outcome === "copied") trackAnalyticsEvent("invite_copied", "/e/[id]");

    setNotice(outcome === "copied" ? "reminder-copied" : outcome === "not-copied" ? "not-copied" : undefined);
  }

  return {
    menu,
    openMenu: () => setMenu("more"),
    closeMenu: () => setMenu(undefined),
    askToDelete: () => setMenu("delete"),
    remind,
    copyLink: () => copy(pollLink(), "link-copied"),
    copyOrganiserLink: () => copy(`${pollLink()}/organizator/${token}`, "organiser-link-copied"),
    notice,
  };
}
