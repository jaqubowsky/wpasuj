"use client";

import { Button } from "@/shared/ui/button/button";
import { SettledBadge } from "@/shared/ui/settled-badge/settled-badge";
import { MenuLink } from "@/shared/ui/menu-item/menu-item";
import { PollPoster } from "@/shared/ui/poll-poster/poll-poster";
import { Sheet } from "@/shared/ui/sheet/sheet";
import { useRef, useState, type ReactNode, type RefObject } from "react";
import type { FinalTime } from "../server/results-schema";
import { googleCalendarLink, outlookCalendarLink } from "../domain/calendar-links";
import { setTimeShown } from "../domain/time-label";
import { useResultsContext } from "./results-provider";
import { useSendSetTime } from "./use-send-set-time";

const notices = {
  copied: "Wiadomość skopiowana. Wklej ją na grupę.",
  "not-copied": "Nie udało się skopiować. Spróbuj jeszcze raz.",
};

export function SetBadge() {
  if (useResultsContext().gone) return null;

  return <SettledBadge />;
}

function CalendarMenu({
  pollId,
  title,
  timeZone,
  final,
  opener,
  onClose,
}: {
  pollId: string;
  title: string;
  timeZone: string;
  final: FinalTime;
  opener: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const event = { title, link: `${location.origin}/e/${pollId}`, timeZone, final };

  return (
    <Sheet label="Dodaj do kalendarza" menuBelow={opener} menuFitsAnchor onClose={onClose}>
      <MenuLink icon="calendar" href={googleCalendarLink(event)} newTab onClick={onClose}>
        Kalendarz Google
      </MenuLink>
      <MenuLink icon="calendar" href={`/e/${pollId}/termin.ics`} onClick={onClose}>
        Kalendarz Apple
      </MenuLink>
      <MenuLink icon="mail" href={outlookCalendarLink(event)} newTab onClick={onClose}>
        Outlook
      </MenuLink>
      <div className="mt-2 lg:hidden">
        <Button block onClick={onClose}>
          Zamknij
        </Button>
      </div>
    </Sheet>
  );
}

export function SettledPoster({ eyebrow, setBy }: { eyebrow: ReactNode; setBy: string }) {
  const { final } = useResultsContext().results;

  if (!final) return null;

  return (
    <section aria-label="Termin">
      <PollPoster tone="coral" eyebrow={eyebrow} when={setTimeShown(final)}>
        <span className="text-base font-semibold">{setBy}</span>
      </PollPoster>
    </section>
  );
}

export function SetActions({ final, title, timeZone }: { final: FinalTime; title: string; timeZone: string }) {
  const { pollId, organiser } = useResultsContext();
  const { notice, send } = useSendSetTime(pollId, title, final);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarOpener = useRef<HTMLButtonElement>(null);

  const calendarAction = (
    <Button
      ref={calendarOpener}
      variant={organiser ? undefined : "primary"}
      block
      aria-haspopup="dialog"
      aria-expanded={calendarOpen}
      onClick={() => setCalendarOpen(true)}
    >
      Dodaj do kalendarza
    </Button>
  );

  const sendAction = (
    <Button variant={organiser ? "primary" : undefined} block onClick={send}>
      Wyślij termin na grupę
    </Button>
  );

  return (
    <div className="grid gap-3.5">
      {organiser && sendAction}
      {calendarAction}
      {!organiser && sendAction}
      {calendarOpen && (
        <CalendarMenu
          pollId={pollId}
          title={title}
          timeZone={timeZone}
          final={final}
          opener={calendarOpener}
          onClose={() => setCalendarOpen(false)}
        />
      )}
      {notice && (
        <p className="m-0 text-sm text-muted" role="status">
          {notices[notice]}
        </p>
      )}
    </div>
  );
}
