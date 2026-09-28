import { Button } from "@/shared/ui/button/button";
import type { GridCell } from "@/shared/day-hour-grid/day-hour-grid";
import { cannotMake, freeAt } from "../domain/best-time";
import { hourLabel } from "../domain/time-label";
import type { Results } from "../server/results-schema";
import { newestFirst } from "../domain/newest-first";
import { PeopleList } from "./people-list";

type CellDetailsProps = { cell: GridCell; results: Results; organiserKey: string };

function CellPeople({ cell, results, organiserKey }: CellDetailsProps) {
  const respondents = newestFirst(results.respondents);
  const free = freeAt(respondents, cell);

  const groups = [
    { label: "Może", people: free },
    {
      label: "Nie może",
      people: cannotMake(
        respondents,
        free.map((person) => person.name),
      ),
      cannot: true,
    },
  ];

  return <PeopleList groups={groups} you={results.you} organiserKey={organiserKey} />;
}

export function CellSheetContent(props: CellDetailsProps) {
  return (
    <>
      <h2 className="m-0 mb-2 font-display text-2xl font-bold tracking-tighter">{hourLabel(props.cell)}</h2>
      <CellPeople {...props} />
    </>
  );
}

export function CellPanel({ onClose, ...props }: CellDetailsProps & { onClose: () => void }) {
  const label = hourLabel(props.cell);

  return (
    <section aria-label={label}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 font-display text-lg font-bold tracking-tight">{label}</h2>
        <Button variant="text" onClick={onClose}>
          Zamknij
        </Button>
      </div>
      <CellPeople {...props} />
    </section>
  );
}
