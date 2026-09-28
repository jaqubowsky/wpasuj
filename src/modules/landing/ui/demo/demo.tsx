"use client";

import { DayHourGrid } from "@/shared/day-hour-grid/day-hour-grid";
import { Avatar } from "@/shared/ui/avatar/avatar";
import { Button } from "@/shared/ui/button/button";
import { Card } from "@/shared/ui/card/card";
import { Cell } from "@/shared/ui/cell/cell";
import { Text } from "@/shared/ui/text/text";
import { demoDates, demoHours, demoPoll, friends, visitor } from "../../domain/demo-poll";
import { GoToFormButton } from "../go-to-form-button";
import "./demo.css";
import { useDemoSlots } from "./use-demo-slots";

export function Demo({ formId }: { formId: string }) {
  const slots = useDemoSlots();
  const poll = demoPoll(slots.mine);

  return (
    <section
      aria-label="Wypróbuj na żywo"
      className="mx-auto box-border max-w-wide px-5 py-20 lg:px-12 lg:pt-30"
    >
      <div className="mb-8 max-w-170 lg:mb-10">
        <p className="m-0 text-sm font-semibold text-accent-ink">Wypróbuj na żywo</p>
        <h2 className="m-0 mt-2 font-display text-3xl font-extrabold tracking-tightest text-balance lg:text-5xl">
          Czworo znajomych już zaznaczyło. Twoja kolej.
        </h2>
        <p className="m-0 mt-3 text-lg text-muted">Kliknij godziny, kiedy możesz. Najlepszy termin przelicza się od razu.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-7">
        <div data-demo-panel className="rounded-card bg-surface p-4 lg:p-6">
          <ul aria-label="Kto już zaznaczył" className="m-0 mb-4 flex list-none flex-wrap gap-2 p-0">
            {[...friends, visitor].map((name) => (
              <li
                key={name}
                data-visitor={name === visitor || undefined}
                className="inline-flex h-9.5 items-center gap-2 rounded-pill bg-paper pr-3.5 pl-1 text-sm font-medium data-visitor:bg-ink data-visitor:text-surface"
              >
                <Avatar name={name} tintKey={name} />
                {name}
              </li>
            ))}
          </ul>
          <DayHourGrid
            label="Twoje godziny"
            dates={demoDates}
            hours={demoHours}
            isSelected={slots.isMine}
            renderCell={({ date, hour, selected, label, tabIndex, preview }) => {
              const { count, heat, everyone, best } = poll.cellAt({ date, hour });
              const marked = preview ? preview === "adding" : selected;
              return (
                <Cell heat={heat} everyone={everyone} best={best} aria-label={`${label}, ${count} z ${poll.respondentCount} może`} tabIndex={tabIndex}>
                  <span className="col-start-1 row-start-1">{count || ""}</span>
                  {marked && <span aria-hidden className="col-start-1 row-start-1 mb-1 size-1.5 self-end rounded-pill bg-current" />}
                </Cell>
              );
            }}
            onCellTap={slots.tap}
            onStroke={slots.stroke}
          />
        </div>
        <div className="flex flex-col gap-3">
          <div role="status" aria-label="Najlepiej">
            <Card tone="ink" label="Najlepiej">
              <div className="mt-1 flex flex-col gap-3">
                <Text as="p" variant="best-time">
                  {poll.best.label}
                </Text>
                <p className="m-0 flex justify-between gap-3 text-sm">
                  <span className="font-semibold text-heat-3">{poll.best.share} może</span>
                  <span>{poll.best.cannot.length > 0 ? `Nie może: ${poll.best.cannot.join(", ")}` : "Wszyscy mogą"}</span>
                </p>
              </div>
            </Card>
          </div>
          <ul aria-label="Też dobre" className="m-0 flex list-none flex-col gap-3 p-0">
            {poll.others.map((other) => (
              <li key={other.label}>
                <Card size="compact">
                  <span className="flex justify-between gap-3 text-sm">
                    <span className="font-semibold">{other.label}</span>
                    <span className="text-muted">{other.share}</span>
                  </span>
                </Card>
              </li>
            ))}
          </ul>
          <p className="m-0 px-0.5 py-1 text-sm text-muted">Liczba w kafelku to ile osób może. Kropka to Twoje godziny.</p>
          <GoToFormButton formId={formId}>Zrób taką ankietę dla swojej paczki</GoToFormButton>
          <div>
            <Button variant="text" onClick={slots.clear}>
              Wyczyść moje godziny
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
