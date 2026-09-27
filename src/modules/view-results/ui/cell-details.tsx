import { Avatar } from "@/shared/ui/avatar/avatar";
import { Button } from "@/shared/ui/button/button";
import { Text } from "@/shared/ui/text/text";
import styles from "./cell-details.module.css";
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
      <ul className={styles.people} aria-label={label}>
        {people.map(({ name, normalisedName }) => (
          <li key={normalisedName}>
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
    <section className={styles.details} aria-label={label}>
      <div className={styles.top}>
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
