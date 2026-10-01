"use client";

import { Button } from "@/shared/ui/button/button";
import { Icon } from "@/shared/ui/icon/icon";
import { useId } from "react";
import { Check, Copied } from "./copied";
import "./invite-card.css";
import { useInviteCard } from "./use-invite-card";

const notCopied = {
  send: "Nie udało się wysłać. Skopiuj link przyciskiem „Kopiuj”.",
  link: "Nie udało się skopiować. Skopiuj link z paska adresu.",
};

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
          <Icon name="check" size={20} stroke={2.5} />
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
          <Icon name="link" />
        </span>
        <span className="truncate">{card.shownLink()}</span>
      </p>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
        <Button variant="primary" block onClick={card.send}>
          <Copied when={card.copiedBy("send")}>
            <Icon name="share" />
            Wyślij na grupę
          </Copied>
        </Button>
        <Button block onClick={card.copyLink}>
          <Copied when={card.copiedBy("link")}>
            <Icon name="copy" />
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
