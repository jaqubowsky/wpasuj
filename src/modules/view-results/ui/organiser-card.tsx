"use client";

import { Button } from "@/shared/ui/button/button";
import { Sheet } from "@/shared/ui/sheet/sheet";
import { useId, useRef } from "react";
import { bestTimes } from "../domain/best-time";
import { deleteWarning } from "../domain/people-count";
import { MenuItem } from "./menu-item";
import { OrganiserProblem } from "./organiser-problem";
import { useResultsContext } from "./results-provider";
import { useOrganiserCard, type CardNotice } from "./use-organiser-card";

const notices: Record<CardNotice, string> = {
  "reminder-copied": "Wiadomość skopiowana. Wklej ją na grupę.",
  "link-copied": "Link skopiowany.",
  "organiser-link-copied": "Link organizatora skopiowany. Otwórz go na swoim drugim urządzeniu. Nie wysyłaj go na grupę: kto go ma, może ustalić termin i usunąć ankietę.",
  "not-copied": "Nie udało się skopiować. Spróbuj jeszcze raz.",
};

type LiveOrganiser = NonNullable<ReturnType<typeof useResultsContext>["organiser"]>;

function OrganiserControls({ organiser }: { organiser: LiveOrganiser }) {
  const { results, organiserProblem, pollId } = useResultsContext();
  const card = useOrganiserCard({ pollId, title: organiser.title, token: organiser.token, respondentNames: results.respondents.map((respondent) => respondent.name) });
  const more = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const [best] = bestTimes(results.dates, results.hours, results.respondents);

  return (
    <section className="grid gap-3 rounded-card bg-surface p-5" aria-labelledby={headingId}>
      <h2 id={headingId} className="m-0 text-sm font-semibold">
        Twoja ankieta
      </h2>
      <div className="grid grid-cols-[auto_minmax(0,1fr)_--spacing(11)] gap-2 data-final:grid-cols-[minmax(0,1fr)_--spacing(11)]" data-final={results.final || !best ? true : undefined}>
        {!results.final && best && (
          <Button variant="primary" size="small" block disabled={organiser.pending} onClick={() => organiser.setFinal({ date: best.date, firstHour: best.firstHour, lastHour: best.lastHour })}>
            Ustal termin
          </Button>
        )}
        {results.final ? (
          <Button size="small" block disabled={organiser.pending} onClick={organiser.clearFinal}>
            Zmień termin
          </Button>
        ) : (
          <Button size="small" block onClick={card.remind}>
            Przypomnij
          </Button>
        )}
        <Button ref={more} size="small" block aria-label="Więcej" aria-haspopup="dialog" aria-expanded={card.menu !== undefined} onClick={card.openMenu}>
          <svg className="size-4.5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </Button>
      </div>
      {card.notice && (
        <p className="m-0 text-sm text-muted" role="status">
          {notices[card.notice]}
        </p>
      )}
      {organiserProblem && <OrganiserProblem problem={organiserProblem} />}
      {card.menu && (
        <Sheet label={card.menu === "delete" ? "Usunąć ankietę?" : "Więcej"} menuBelow={more} onClose={card.closeMenu}>
          {card.menu === "delete" ? (
            <div className="grid gap-3 lg:p-2">
              <h2 className="m-0 font-display text-2xl font-bold tracking-tighter">Usunąć ankietę?</h2>
              <p className="m-0 text-base">{deleteWarning(results.respondents.length)}</p>
              <div className="mt-1 grid gap-2">
                <Button variant="danger" block disabled={organiser.pending} onClick={organiser.deletePoll}>
                  Tak, usuń
                </Button>
                <Button block onClick={card.closeMenu}>
                  Nie, zostaw
                </Button>
              </div>
            </div>
          ) : (
            <>
              <MenuItem icon="copy" onClick={card.copyLink}>
                Kopiuj link do ankiety
              </MenuItem>
              <MenuItem icon="phone" onClick={card.copyOrganiserLink}>
                Link organizatora na inny telefon
              </MenuItem>
              <span className="my-1 block h-px bg-line" aria-hidden="true" />
              <MenuItem icon="trash" danger onClick={card.askToDelete}>
                Usuń ankietę
              </MenuItem>
              <div className="mt-2 lg:hidden">
                <Button block onClick={card.closeMenu}>
                  Zamknij
                </Button>
              </div>
            </>
          )}
        </Sheet>
      )}
    </section>
  );
}

export function OrganiserCard() {
  const { organiser, organiserProblem } = useResultsContext();
  if (organiser) return <OrganiserControls organiser={organiser} />;
  return organiserProblem ? <OrganiserProblem problem={organiserProblem} /> : null;
}
