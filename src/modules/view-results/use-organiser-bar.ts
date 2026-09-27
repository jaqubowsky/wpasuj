import { shareOrCopy } from "@/shared/share-link";
import { useState } from "react";
import { reminderText } from "./reminder-text";

export type BarNotice = "reminder-copied" | "link-copied" | "organiser-link-copied" | "not-copied";

type BarInput = { pollId: string; title: string; token: string; respondentNames: string[] };

export function useOrganiserBar({ pollId, title, token, respondentNames }: BarInput) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [notice, setNotice] = useState<BarNotice>();
  const pollLink = () => `${location.origin}/e/${pollId}`;

  async function copy(text: string, copied: BarNotice) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(copied);
    } catch {
      setNotice("not-copied");
    }
  }

  async function remind() {
    const message = reminderText(respondentNames, { title, link: pollLink() });
    const outcome = await shareOrCopy({ text: message, link: message });
    setNotice(outcome === "copied" ? "reminder-copied" : outcome === "not-copied" ? "not-copied" : undefined);
  }

  return {
    menuOpen,
    toggleMenu: () => setMenuOpen((open) => !open),
    remind,
    copyLink: () => copy(pollLink(), "link-copied"),
    copyOrganiserLink: () => copy(`${pollLink()}/organizator/${token}`, "organiser-link-copied"),
    confirmingDelete,
    askToDelete: () => setConfirmingDelete(true),
    keepPoll: () => setConfirmingDelete(false),
    notice,
  };
}
