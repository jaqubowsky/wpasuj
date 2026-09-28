"use client";

import { Button } from "@/shared/ui/button/button";
import { useId, type ReactNode } from "react";
import "./invite-card.css";
import { useInviteCard } from "./use-invite-card";

const notCopied = {
  send: "Nie udało się wysłać. Skopiuj link przyciskiem „Kopiuj”.",
  link: "Nie udało się skopiować. Skopiuj link z paska adresu.",
};

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="size-4.5 flex-none"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function Check() {
  return (
    <span className="grid size-5 flex-none place-items-center rounded-pill bg-accent text-ink" aria-hidden="true">
      <svg
        className="size-3"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2.5 6.2 5 8.5 9.5 3.5" />
      </svg>
    </span>
  );
}

function Copied({ when, children }: { when: boolean; children: ReactNode }) {
  if (!when) return children;

  return (
    <span className="inline-flex items-center gap-2" data-invite-copied>
      <Check />
      Skopiowano
    </span>
  );
}

export function InviteCard({ pollId, title }: { pollId: string; title: string }) {
  const card = useInviteCard(pollId, title);
  const headingId = useId();

  if (card.stage === "closed") return null;

  if (card.stage === "sent") {
    return (
      <p
        className="m-0 mt-2 flex items-center gap-2.5 rounded-control bg-surface px-4 py-3 text-sm font-medium"
        role="status"
        data-invite-sent
      >
        <Check />
        Wysłane. Odpowiedzi pojawią się tutaj.
      </p>
    );
  }

  return (
    <section className="mt-2 grid gap-4 rounded-card bg-surface p-5 shadow-lift" aria-labelledby={headingId} data-invite-card>
      <div className="flex items-center gap-3">
        <span className="grid size-10 flex-none place-items-center rounded-pill bg-accent text-surface" aria-hidden="true">
          <svg
            className="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <div className="grid">
          <h2 id={headingId} className="m-0 font-display text-xl font-bold tracking-tight">
            Ankieta gotowa
          </h2>
          <span className="text-sm text-muted">Wyślij link znajomym na grupę</span>
        </div>
      </div>
      <p className="m-0 flex h-11 min-w-0 items-center gap-2.5 rounded-cell bg-track px-3.5 text-sm">
        <span className="flex text-muted">
          <Icon>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </Icon>
        </span>
        <span className="truncate">{card.shownLink()}</span>
      </p>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
        <Button variant="primary" block onClick={card.send}>
          <Copied when={card.copiedBy("send")}>
            <Icon>
              <path d="M12 3v12" />
              <path d="m7 8 5-5 5 5" />
              <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
            </Icon>
            Wyślij na grupę
          </Copied>
        </Button>
        <Button block onClick={card.copyLink}>
          <Copied when={card.copiedBy("link")}>
            <Icon>
              <rect x="9" y="9" width="12" height="12" rx="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </Icon>
            Kopiuj
          </Copied>
        </Button>
      </div>
      {card.notCopiedBy && (
        <p className="m-0 text-sm font-medium text-accent-ink" role="alert">
          {notCopied[card.notCopiedBy]}
        </p>
      )}
    </section>
  );
}
