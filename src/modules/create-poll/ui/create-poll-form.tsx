"use client";

import { Button } from "@/shared/ui/button/button";
import { Input } from "@/shared/ui/input/input";
import { TitleInput } from "@/shared/ui/title-input/title-input";
import { pollTitleMorph } from "@/shared/morph";
import { useState } from "react";
import "./create-poll-form.css";
import { DatePicker, PendingDatePicker } from "./date-picker";
import { HourRangePicker } from "./hour-range-picker";
import { useCreatePoll } from "./use-create-poll";
import { useDateSelection } from "./use-date-selection";
import { useHourRange } from "./use-hour-range";
import { useOrganiserName } from "./use-organiser-name";

export function CreatePollForm() {
  const [title, setTitle] = useState("");
  const { dates, picker } = useDateSelection();
  const hours = useHourRange();
  const [name, setName] = useOrganiserName();
  const { submit, interact, status, isInvalid, fieldRef } = useCreatePoll({ title, dates, ...hours.range, organiserName: name });

  return (
    <form
      className="flex flex-col gap-6 lg:pb-10"
      noValidate
      onInputCapture={interact}
      onClickCapture={interact}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <TitleInput
        label="Co robimy?"
        placeholder="Co robimy?"
        maxLength={60}
        morph={pollTitleMorph}
        ref={fieldRef("title")}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        error={isInvalid("title") ? "Wpisz, co robicie" : undefined}
      />
      <div className="-mx-3 flex flex-col gap-6 rounded-card bg-surface p-3 pb-0 shadow-poster lg:mx-0 lg:p-6">
        <fieldset ref={fieldRef("dates")} className="m-0 min-w-0 border-0 p-0">
          <legend className="mb-3 p-0 font-display text-lg font-bold tracking-tight normal-nums">Kiedy?</legend>
          {picker ? <DatePicker dates={dates} picker={picker} /> : <PendingDatePicker />}
          {isInvalid("dates") && <p className="mt-2 mb-0 text-sm font-medium text-accent-ink">Wybierz co najmniej jeden dzień</p>}
        </fieldset>
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="mb-3 p-0 font-display text-lg font-bold tracking-tight normal-nums">O której?</legend>
          <HourRangePicker hours={hours} />
        </fieldset>
        <Input
          label="Twoje imię"
          autoComplete="given-name"
          enterKeyHint="done"
          maxLength={30}
          ref={fieldRef("organiserName")}
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={isInvalid("organiserName") ? "Wpisz swoje imię" : undefined}
        />
        <div
          className="sticky bottom-0 -mx-3 flex flex-col gap-2 rounded-b-card border-t border-line bg-surface px-3 pt-3 pb-[calc(--spacing(3)+env(safe-area-inset-bottom))] lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0"
          data-report-pill-clear
        >
          {status === "refused" && (
            <p className="m-0 text-sm font-medium text-accent-ink" role="alert">
              Nie udało się utworzyć ankiety. Sprawdź daty i spróbuj jeszcze raz.
            </p>
          )}
          {status === "failed" && (
            <p className="m-0 text-sm font-medium text-accent-ink" role="alert">
              Nie udało się utworzyć ankiety. Sprawdź internet i spróbuj jeszcze raz.
            </p>
          )}
          <Button type="submit" variant="primary" block aria-busy={status === "creating"}>
            {status === "creating" ? (
              <span className="inline-flex items-center gap-2" data-create-pending>
                <span
                  className="box-border size-4 rounded-pill border-2 border-solid border-surface/35 border-t-surface"
                  aria-hidden="true"
                  data-create-spinner
                />
                Tworzę ankietę…
              </span>
            ) : (
              "Utwórz i wyślij na grupę"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
