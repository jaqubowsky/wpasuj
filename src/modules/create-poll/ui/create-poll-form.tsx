"use client";

import { Button } from "@/shared/ui/button/button";
import { Input } from "@/shared/ui/input/input";
import { useState } from "react";
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
  const { submit, status, isInvalid } = useCreatePoll({ title, dates, ...hours.range, organiserName: name });

  return (
    <form
      className="flex flex-col gap-8 lg:pb-10"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Input
        label="Co robimy?"
        variant="title"
        placeholder="Piwo, planszówki, kino…"
        maxLength={60}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        error={isInvalid("title") ? "Wpisz, co robicie" : undefined}
      />
      <fieldset className="m-[0] min-w-[0] border-0 p-[0]">
        <legend className="mb-3 p-[0] font-display text-section font-bold tracking-[-0.01em] normal-nums">Kiedy?</legend>
        {picker ? <DatePicker dates={dates} picker={picker} /> : <PendingDatePicker />}
        {isInvalid("dates") && <p className="mt-2 mb-[0] text-label font-medium text-accent-ink">Wybierz co najmniej jeden dzień</p>}
      </fieldset>
      <fieldset className="m-[0] min-w-[0] border-0 p-[0]">
        <legend className="mb-3 p-[0] font-display text-section font-bold tracking-[-0.01em] normal-nums">O której?</legend>
        <HourRangePicker hours={hours} />
      </fieldset>
      <Input
        label="Twoje imię"
        autoComplete="given-name"
        enterKeyHint="done"
        maxLength={30}
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={isInvalid("organiserName") ? "Wpisz swoje imię" : undefined}
      />
      <div className="sticky bottom-[0] -mx-5 flex flex-col gap-2 border-t border-line bg-paper px-5 pt-3 pb-[calc(var(--spacing-3)+env(safe-area-inset-bottom))] lg:static lg:mx-[0] lg:border-0 lg:bg-transparent lg:p-[0]">
        {status === "refused" && (
          <p className="m-[0] text-label font-medium text-accent-ink" role="alert">
            Nie udało się utworzyć ankiety. Sprawdź daty i spróbuj jeszcze raz.
          </p>
        )}
        {status === "failed" && (
          <p className="m-[0] text-label font-medium text-accent-ink" role="alert">
            Coś poszło nie tak. Spróbuj jeszcze raz.
          </p>
        )}
        {status === "not-copied" && (
          <p className="m-[0] text-label font-medium text-accent-ink" role="alert">
            Nie udało się skopiować linku. Skopiuj go z paska adresu.
          </p>
        )}
        {status === "copied" && (
          <p className="m-[0] text-center font-semibold" role="status">
            Link skopiowany
          </p>
        )}
        <Button type="submit" variant="primary" block aria-busy={status === "creating"}>
          Utwórz i wyślij na grupę
        </Button>
      </div>
    </form>
  );
}
