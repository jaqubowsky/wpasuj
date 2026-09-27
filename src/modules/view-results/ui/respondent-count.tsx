"use client";

import { Avatar } from "@/shared/ui/avatar/avatar";
import { Sheet } from "@/shared/ui/sheet/sheet";
import { Text } from "@/shared/ui/text/text";
import { useState } from "react";
import { answeredCount, peopleCount } from "../domain/people-count";
import { newestFirst } from "../domain/newest-first";
import { PeopleList } from "./people-list";
import { useResultsContext } from "./results-provider";

const stackSize = 3;

export function RespondentCount() {
  const { results, organiserKey, gone } = useResultsContext();
  const [open, setOpen] = useState(false);
  const count = results.respondents.length;

  if (gone) return null;
  if (count === 0) return <Text variant="meta">{answeredCount(0)}</Text>;

  const newest = newestFirst(results.respondents);
  const groups = [
    { label: "Zaznaczyli godziny", people: newest.filter((person) => person.slots.length > 0) },
    { label: "Nie może w żadnym", people: newest.filter((person) => person.slots.length === 0) },
  ];

  return (
    <>
      <span className="hidden lg:inline">
        <Text variant="meta">{answeredCount(count)}</Text>
      </span>
      <button
        type="button"
        className="box-border inline-flex h-11 cursor-pointer items-center gap-2 rounded-pill border-0 bg-surface px-3 font-sans text-sm font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-edge)] transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-safe:active:scale-97 lg:hidden"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <span className="inline-flex" aria-hidden="true">
          {newest.slice(0, stackSize).map((person) => (
            <Avatar key={person.normalisedName} name={person.name} tintKey={person.normalisedName} size="dot" />
          ))}
        </span>
        {peopleCount(count)}
      </button>
      {open && (
        <Sheet label="Odpowiedzieli" onClose={() => setOpen(false)}>
          <h2 className="m-0 mb-2 font-display text-2xl font-bold tracking-tighter">Odpowiedzieli</h2>
          <PeopleList groups={groups} you={results.you} organiserKey={organiserKey} />
        </Sheet>
      )}
    </>
  );
}
