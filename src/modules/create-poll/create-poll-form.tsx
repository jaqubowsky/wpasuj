"use client";

import { Button } from "@/shared/ui/button/button";
import { Input } from "@/shared/ui/input/input";
import { useState } from "react";
import styles from "./create-poll-form.module.css";
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
      className={styles.form}
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
      <fieldset className={styles.question}>
        <legend>Kiedy?</legend>
        {picker ? <DatePicker dates={dates} picker={picker} /> : <PendingDatePicker />}
        {isInvalid("dates") && <p className={styles.notice}>Wybierz co najmniej jeden dzień</p>}
      </fieldset>
      <fieldset className={styles.question}>
        <legend>O której?</legend>
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
      <div className={styles.bar}>
        {status === "refused" && (
          <p className={styles.notice} role="alert">
            Nie udało się utworzyć ankiety. Sprawdź daty i spróbuj jeszcze raz.
          </p>
        )}
        {status === "failed" && (
          <p className={styles.notice} role="alert">
            Coś poszło nie tak. Spróbuj jeszcze raz.
          </p>
        )}
        {status === "not-copied" && (
          <p className={styles.notice} role="alert">
            Nie udało się skopiować linku. Skopiuj go z paska adresu.
          </p>
        )}
        {status === "copied" && (
          <p className={styles.copied} role="status">
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
