"use client";

import { Board } from "@/shared/ui/board/board";
import { Sheet } from "@/shared/ui/sheet/sheet";
import { Text } from "@/shared/ui/text/text";
import { useMediaQuery } from "@/shared/use-media-query";
import { hourLabel } from "../domain/time-label";
import { CellSheetContent } from "./cell-details";
import { Heatmap } from "./heatmap";
import { useResultsContext } from "./results-provider";

export function ResultsBody() {
  const { results, organiserKey, selection, refreshFailed } = useResultsContext();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const { respondents } = results;

  const refreshProblem = refreshFailed && (
    <Text as="p" variant="meta">
      Nie udało się odświeżyć. Spróbujemy za chwilę.
    </Text>
  );

  if (respondents.length === 0) {
    return (
      <Board>
        <Text variant="body">Nikt jeszcze nie odpowiedział. Wyślij link na grupę.</Text>
        {refreshProblem}
      </Board>
    );
  }

  return (
    <Board>
      <p className="m-0 text-base text-muted">Kliknij godzinę, żeby zobaczyć, kto może.</p>
      <Heatmap results={results} isSelected={selection.isSelected} onCellTap={selection.toggle} />
      {refreshProblem}
      {selection.selected && !desktop && (
        <Sheet label={hourLabel(selection.selected)} onClose={selection.close}>
          <CellSheetContent cell={selection.selected} results={results} organiserKey={organiserKey} />
        </Sheet>
      )}
    </Board>
  );
}
