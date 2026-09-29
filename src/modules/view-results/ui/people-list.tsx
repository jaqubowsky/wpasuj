import { Avatar } from "@/shared/ui/avatar/avatar";
import { useId } from "react";
import "./people-list.css";
import type { Results } from "../server/results-schema";

type Person = Pick<Results["respondents"][number], "name" | "normalisedName" | "slots">;

type PeopleGroup = { label: string; people: Person[]; can?: boolean; cannot?: boolean };

type PeopleListProps = {
  groups: PeopleGroup[];
  you?: string;
  organiserKey: string;
  arrived?: (person: Person) => boolean;
};

export function PeopleList({ groups, you, organiserKey, arrived }: PeopleListProps) {
  const id = useId();

  return groups
    .filter((group) => group.people.length > 0)
    .map((group, index) => (
      <div
        key={group.label}
        className="not-first-of-type:mt-2 not-first-of-type:border-0 not-first-of-type:border-t not-first-of-type:border-solid not-first-of-type:border-line"
      >
        <div className="flex h-9 items-baseline justify-between pt-2 text-sm font-semibold">
          <h3 id={`${id}-${index}`} className="m-0 text-sm font-semibold">
            {group.label}
          </h3>
          <span>{group.people.length}</span>
        </div>
        <ul className="-mx-1.5 my-0 list-none p-0" aria-label={group.label}>
          {group.people.map((person) => {
            const isYou = person.normalisedName === you;
            const isOrganiser = person.normalisedName === organiserKey;
            const cannot = group.cannot || person.slots.length === 0;
            const states = [isYou && "to Ty", isOrganiser && "organizator", cannot && "nie może"].filter(Boolean);

            return (
              <li
                key={person.normalisedName}
                className="flex h-11 items-center gap-3 rounded-cell px-1.5 text-base transition-[background-color,translate] duration-(--duration-fill) ease-out data-can:translate-x-1 data-can:bg-heat-1 data-cannot:text-muted motion-safe:data-can:animate-[people-nudge_var(--duration-pop)_var(--ease-out)]"
                data-can={group.can || undefined}
                data-cannot={cannot || undefined}
              >
                <Avatar
                  name={person.name}
                  tintKey={person.normalisedName}
                  you={isYou}
                  mark={cannot ? "cannot" : isOrganiser ? "organiser" : undefined}
                  pop={arrived?.(person)}
                />
                {person.name}
                {states.length > 0 && <span className="sr-only">, {states.join(", ")}</span>}
              </li>
            );
          })}
        </ul>
      </div>
    ));
}
