"use client";

import { Avatar } from "@/shared/ui/avatar/avatar";
import type { FinalTime } from "../server/results-schema";
import { cannotLine, comingLine, whoComes } from "../domain/set-time";
import { useResultsContext } from "./results-provider";

export function WhoComes({ final }: { final: FinalTime }) {
  const { results, organiserKey } = useResultsContext();

  if (results.respondents.length === 0) return null;

  const { coming, cannot } = whoComes(results.respondents, final);
  const cannotSay = cannotLine(cannot.map((person) => person.name));

  return (
    <section aria-label="Kto będzie" className="grid justify-items-start gap-4">
      <p className="m-0 font-display text-2xl font-extrabold tracking-tight">{comingLine(coming.length)}</p>
      {coming.length > 0 && (
        <ul className="m-0 flex list-none p-0" aria-label="Będzie">
          {coming.map((person) => (
            <li key={person.normalisedName} className="-ml-2 flex first:ml-0">
              <Avatar
                name={person.name}
                tintKey={person.normalisedName}
                stack="paper"
                mark={person.normalisedName === organiserKey ? "organiser" : undefined}
              />
              {person.normalisedName === organiserKey && <span className="sr-only">, organizator</span>}
            </li>
          ))}
        </ul>
      )}
      {cannotSay && <p className="m-0 text-base text-muted">{cannotSay}</p>}
    </section>
  );
}
