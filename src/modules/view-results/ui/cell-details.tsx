import { Avatar } from "@/shared/ui/avatar/avatar";
import { Button } from "@/shared/ui/button/button";
import { Text } from "@/shared/ui/text/text";
import "./cell-details.css";
import type { Results } from "../server/results-schema";
import { hourLabel } from "../domain/time-label";

type Person = Pick<Results["respondents"][number], "name" | "normalisedName">;

type CellDetailsProps = {
  cell: { date: string; hour: number };
  free: Person[];
  cannot: Person[];
  onClose: () => void;
};

function People({ label, people }: { label: string; people: Person[] }) {
  if (people.length === 0) return null;
  return (
    <div>
      <Text as="h3" variant="meta">
        {label}
      </Text>
      <ul className="m-[0] list-none p-[0]" aria-label={label}>
        {people.map(({ name, normalisedName }) => (
          <li key={normalisedName} className="flex min-h-target items-center gap-3">
            <Avatar name={name} tintKey={normalisedName} />
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CellDetails({ cell, free, cannot, onClose }: CellDetailsProps) {
  const label = hourLabel(cell);

  return (
    <section className="fixed inset-x-[0] bottom-[0] z-10 mx-auto box-border grid max-h-[60dvh] max-w-[600px] animate-[cell-details-slide-up_var(--duration-sheet)_ease-out] gap-3 overflow-y-auto rounded-t-card bg-surface px-5 pt-4 pb-[calc(var(--spacing-5)+env(safe-area-inset-bottom))] shadow-sheet lg:static lg:m-[0] lg:max-h-none lg:max-w-none lg:animate-none lg:rounded-card lg:pb-5 lg:shadow-none" aria-label={label}>
      <div className="flex items-center justify-between gap-3">
        <Text as="h2" variant="heading">
          {label}
        </Text>
        <Button variant="text" onClick={onClose}>
          Zamknij
        </Button>
      </div>
      <People label="Mogą" people={free} />
      <People label="Nie mogą" people={cannot} />
    </section>
  );
}
