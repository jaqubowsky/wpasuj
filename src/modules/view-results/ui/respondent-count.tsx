"use client";

import { Avatar } from "@/shared/ui/avatar/avatar";
import { Sheet } from "@/shared/ui/sheet/sheet";
import { useState } from "react";
import { answeredCount, peopleCount } from "../domain/people-count";
import { newestFirst } from "../domain/newest-first";
import { PeopleList } from "./people-list";
import { useResultsContext } from "./results-provider";

const stackSize = 5;

export function RespondentCount({ ground }: { ground: "coral" | "ink" }) {
  const { results, organiserKey, gone } = useResultsContext();
  const [open, setOpen] = useState(false);
  const count = results.respondents.length;

  if (gone) return null;
  if (count === 0) return <span className="text-base font-semibold">{answeredCount(0)}</span>;

  const newest = newestFirst(results.respondents);

  const groups = [
    { label: "Zaznaczyli godziny", people: newest.filter((person) => person.slots.length > 0) },
    { label: "Nie może w żadnym", people: newest.filter((person) => person.slots.length === 0) },
  ];

  const faces = (
    <span className="inline-flex" aria-hidden="true">
      {newest.slice(0, stackSize).map((person) => (
        <Avatar key={person.normalisedName} name={person.name} tintKey={person.normalisedName} stack={ground} />
      ))}
    </span>
  );

  return (
    <>
      <span className="hidden text-base font-semibold lg:inline">{answeredCount(count)}</span>
      <span className="hidden lg:inline-flex">{faces}</span>
      <button
        type="button"
        className="-mx-1 box-border inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-control border-0 bg-transparent px-1 font-sans text-base font-semibold text-current transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-safe:active:scale-97 lg:hidden"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        {faces}
        <span>{peopleCount(count)}</span>
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
