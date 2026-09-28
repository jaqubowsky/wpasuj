import { useEffect, useState, type KeyboardEvent } from "react";

type HourColumnName = "Od" | "Do";

type Opener = { button: HTMLElement; column: HourColumnName };

export function openHourSheet(sheet: HTMLDialogElement | null) {
  if (!sheet || sheet.open) return;
  sheet.showModal();
  const picked = [...sheet.querySelectorAll<HTMLElement>("[aria-pressed=true]")];
  for (const hour of picked) {
    const column = hour.parentElement;
    if (column) column.scrollTop = hour.offsetTop - column.offsetTop - (column.clientHeight - hour.offsetHeight) / 2;
  }
  sheet.querySelector<HTMLElement>(`[aria-label="${sheet.dataset.openedFrom}"] [aria-pressed=true]`)?.focus({ preventScroll: true });
}

export function useHourSheet() {
  const [opener, setOpener] = useState<Opener>();
  const [closedFrom, setClosedFrom] = useState<Opener>();

  useEffect(() => closedFrom?.button.focus(), [closedFrom]);

  function close() {
    setOpener(undefined);
    setClosedFrom(opener);
  }

  return {
    openedFrom: opener?.column,
    show: (button: HTMLElement, column: HourColumnName) => setOpener({ button, column }),
    close,
    closeOnEscape: (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
    },
  };
}

export type HourSheetState = ReturnType<typeof useHourSheet>;
