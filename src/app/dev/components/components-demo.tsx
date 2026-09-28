"use client";

import { productName } from "@/shared/brand";
import { Avatar } from "@/shared/ui/avatar/avatar";
import { Button } from "@/shared/ui/button/button";
import { Card } from "@/shared/ui/card/card";
import { Cell } from "@/shared/ui/cell/cell";
import { Chip } from "@/shared/ui/chip/chip";
import { Input } from "@/shared/ui/input/input";
import { Segment } from "@/shared/ui/segment/segment";
import { Status } from "@/shared/ui/status/status";
import { Stepper } from "@/shared/ui/stepper/stepper";
import { Text } from "@/shared/ui/text/text";
import { useState, type ReactNode } from "react";

const views = ["Moje", "Wszyscy"] as const;

const people = [
  { name: "Zosia", key: "zosia" },
  { name: "Ola", key: "ola" },
  { name: "Ewa", key: "ewa" },
  { name: "Bartek", key: "bartek" },
  { name: "Kuba", key: "kuba" },
];

function Section({ name, children }: { name: string; children: ReactNode }) {
  return (
    <section className="grid gap-3" aria-label={name}>
      <Text as="h2" variant="heading">
        {name}
      </Text>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}

export function ComponentsDemo() {
  const [view, setView] = useState<(typeof views)[number]>("Moje");
  const [hour, setHour] = useState(19);

  return (
    <main className="mx-auto box-border grid max-w-narrow gap-8 px-5 pt-6 pb-10">
      <Section name="Text">
        <div className="grid w-full gap-3">
          <Text variant="wordmark">{productName}</Text>
          <Text variant="title">Planszówki u Michała</Text>
          <Text variant="best-time">Sobota 18.10, 19–22</Text>
          <Text variant="day-number">17</Text>
          <Text variant="heading">Kiedy możesz?</Text>
          <Text variant="body">Kliknij godziny, kiedy możesz.</Text>
          <Text variant="chip">Ten weekend</Text>
          <Text variant="button">Utwórz i wyślij na grupę</Text>
          <Text variant="meta">sb · 19:00</Text>
        </div>
      </Section>
      <Section name="Button">
        <Button variant="primary" block>
          Utwórz i wyślij na grupę
        </Button>
        <Button>Przypomnij</Button>
        <Button size="small">Więcej</Button>
        <Button variant="text">Nie mogę w żadnym terminie</Button>
        <Button variant="primary" disabled>
          Wyłączony
        </Button>
        <Card tone="ink">
          <Button variant="on-dark" block>
            Ustal ten termin
          </Button>
        </Card>
      </Section>
      <Section name="Chip">
        <Chip pressed={false}>Dziś</Chip>
        <Chip pressed>Ten weekend</Chip>
      </Section>
      <Section name="Segment">
        <div className="grid w-full gap-3">
          <Segment
            label="Widok"
            options={views}
            selected={view}
            onSelect={setView}
            panels={{ Moje: <Text variant="meta">moja siatka</Text>, Wszyscy: <Text variant="meta">wyniki</Text> }}
          />
        </div>
      </Section>
      <Section name="Input">
        <div className="grid w-full gap-3">
          <Input label="Co robimy?" variant="title" placeholder="Piwo, planszówki, kino…" />
          <Input label="Tytuł z błędem" variant="title" defaultValue="" error="Wpisz, co robicie" />
          <Input label="Jak masz na imię?" placeholder="Twoje imię" />
          <Input label="Imię wpisane" defaultValue="Ola" />
          <Input label="Imię z błędem" defaultValue="Ola" error="To imię już jest w tej ankiecie." />
        </div>
      </Section>
      <Section name="Stepper">
        <Stepper label="od" value={hour} min={0} max={23} onChange={setHour} />
        <Stepper label="od" value={0} min={0} max={23} onChange={() => {}} />
        <Stepper label="do" value={24} min={18} max={24} onChange={() => {}} />
      </Section>
      <Section name="Cell">
        <Cell aria-label="wolne" />
        <Cell state="mine" aria-label="moje" />
        <Cell state="adding" aria-label="dodaję" />
        <Cell state="removing" aria-label="usuwam" />
        <Cell heat={0} aria-label="nikt" />
        {([1, 2, 3, 4, 5] as const).map((heat) => (
          <Cell key={heat} heat={heat} aria-label={`ciepło ${heat}`}>
            {heat}
          </Cell>
        ))}
        <Cell heat={5} everyone aria-label="wszyscy">
          6
        </Cell>
        <Cell heat={5} best aria-label="najlepiej">
          5
        </Cell>
      </Section>
      <Section name="Card">
        <Card label="Surface">Grupuje jedną rzecz na tle strony.</Card>
        <Card tone="ink" label="Najlepiej">
          Jeden na ekran
        </Card>
        <Card size="compact">pt 17.10, 18–20</Card>
      </Section>
      <Section name="Avatar">
        {people.map(({ name, key }) => (
          <Avatar key={key} name={name} tintKey={key} />
        ))}
        <Avatar name="Michał" tintKey="michał" pop />
      </Section>
      <Section name="Status">
        <Status state="saving" />
        <Status state="saved" />
        <Status state="failed" />
      </Section>
    </main>
  );
}
