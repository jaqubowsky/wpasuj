import type { ComponentType } from "react";
import { CreateForm } from "./scenes/create-form";
import { PaintPoll } from "./scenes/paint-poll";
import { SilentGroup } from "./scenes/silent-group";

export type SceneProps = { time: number };

type StoryStep = {
  label: string;
  kicker: string;
  heading: string;
  body: string;
  Scene?: ComponentType<SceneProps>;
};

export const storySteps: StoryStep[] = [
  {
    label: "Na grupie cisza",
    kicker: "Znasz to",
    heading: "Pytanie do wszystkich to pytanie do nikogo.",
    body: "Pięć osób wyświetliło i nikt nie odpisał. Każdy czeka, aż zrobi to ktoś inny.",
    Scene: SilentGroup,
  },
  {
    label: "Tworzysz ankietę",
    kicker: "Krok 1",
    heading: "Ankieta w trzy tapnięcia.",
    body: "Co robicie, który weekend, jaka pora. Bez konta i bez maila.",
    Scene: CreateForm,
  },
  {
    label: "Wrzucasz link",
    kicker: "Krok 2",
    heading: "Jeden link zamiast pytania.",
    body: "W podglądzie od razu widać, o co chodzi. Otwiera się w Messengerze, bez logowania.",
  },
  {
    label: "Każdy klika godziny",
    kicker: "Krok 3",
    heading: "Każdy klika swoje godziny.",
    body: "Imię i kilka kafelków. Można przeciągnąć palcem po kilku naraz. Zapisuje się samo.",
    Scene: PaintPoll,
  },
  {
    label: "Godziny się nagrzewają",
    kicker: "Krok 4",
    heading: "Wspólne godziny robią się coraz cieplejsze.",
    body: "Im więcej osób może, tym mocniejszy kolor i większa liczba w kafelku.",
  },
  {
    label: "Najlepszy termin",
    kicker: "Krok 5",
    heading: "Najlepszy termin wyskakuje sam.",
    body: "Nie liczysz, kto kiedy może. Wpasuj pokazuje najlepszy termin i dwa zapasowe.",
  },
  {
    label: "Ustalone",
    kicker: "Gotowe",
    heading: "Ustalone. Prosto do kalendarza.",
    body: "Jedno kliknięcie organizatora i każdy dodaje termin do swojego kalendarza.",
  },
];
