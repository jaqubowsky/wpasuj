"use client";

import { Button } from "@/shared/ui/button/button";
import { useId, type ReactNode } from "react";
import { linkPreview } from "../domain/link-preview";
import "./invite-card.css";
import { useInviteCard } from "./use-invite-card";

type InviteCardProps = { pollId: string; poll: Parameters<typeof linkPreview>[0] };

const miniRows = 4;

function Check() {
  return (
    <span className="grid size-5 flex-none place-items-center rounded-pill bg-accent text-ink" aria-hidden="true">
      <svg className="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

export function InviteCard({ pollId, poll }: InviteCardProps) {
  const card = useInviteCard(pollId, poll.title);
  const headingId = useId();

  if (card.stage === "closed") return null;

  if (card.stage === "sent") {
    return (
      <p className="m-[0] mt-4 flex items-center gap-[10px] rounded-control bg-surface px-4 py-3 text-caption font-medium" role="status" data-invite-sent>
        <Check />
        Wysłane. Odpowiedzi pojawią się tutaj.
      </p>
    );
  }

  const { asker, title, when } = linkPreview(poll);

  return (
    <section className="mt-4 flex flex-col gap-3 rounded-card bg-surface p-4" aria-labelledby={headingId} data-invite-card>
      <div className="flex items-start justify-between gap-3">
        <h2 id={headingId} className="m-[0] pt-3 font-display text-section font-bold tracking-[-0.02em]">
          Ankieta gotowa. Wyślij ją na grupę.
        </h2>
        <Button variant="text" onClick={card.close}>
          Gotowe
        </Button>
      </div>
      <figure className="m-[0] overflow-hidden rounded-control shadow-[inset_0_0_0_1px_var(--color-line)]" aria-label="Podgląd linku w czacie">
        <div className="grid grid-cols-[minmax(0,1fr)_64px] items-center gap-[10px] bg-paper p-3">
          <div className="min-w-[0]">
            <span className="mb-[3px] block text-mini font-medium text-muted">{asker}</span>
            <span className="block font-display text-section font-extrabold tracking-[-0.02em] [overflow-wrap:anywhere]">{title}</span>
          </div>
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${poll.dates.length}, minmax(0, 1fr))` }} aria-hidden="true">
            {Array.from({ length: poll.dates.length * miniRows }, (_, index) => (
              <i key={index} className="block h-[8px] rounded-[3px] bg-surface shadow-[inset_0_0_0_1px_var(--color-edge)]" />
            ))}
          </div>
        </div>
        <figcaption className="bg-surface px-3 py-[7px] text-mini font-medium text-muted">
          {card.host()} · {when}
        </figcaption>
      </figure>
      <div className="grid grid-cols-[1.4fr_1fr] gap-2">
        <Button variant="primary" block onClick={card.send}>
          <Copied when={card.copiedBy("send")}>Wyślij na grupę</Copied>
        </Button>
        <Button block onClick={card.copyLink}>
          <Copied when={card.copiedBy("link")}>Kopiuj link</Copied>
        </Button>
      </div>
      {card.notCopied && (
        <p className="m-[0] text-label font-medium text-accent-ink" role="alert">
          Nie udało się skopiować. Skopiuj link z paska adresu.
        </p>
      )}
    </section>
  );
}
