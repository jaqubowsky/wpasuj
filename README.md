<p align="center">
  <img src="docs/readme/mark.png" width="64" height="64" alt="">
</p>

<h1 align="center">Wpasuj</h1>

<p align="center">Wrzucasz jeden link na grupę, każdy klika godziny, kiedy może. Najlepszy termin wyskakuje sam.</p>

<p align="center">
  <a href="https://wpasuj.pl"><img src="https://img.shields.io/badge/strona-wpasuj.pl-f0603f" alt="strona: wpasuj.pl"></a>
</p>

<p align="center">
  <img src="docs/readme/landing-1440.png" alt="Pierwszy ekran Wpasuj na komputerze">
</p>

## Jak to działa

1. Wpisujesz, co robicie, i zaznaczasz dni i godziny.
2. Wrzucasz link na grupę. Znajomi wpisują imię i klikają godziny, bez zakładania konta.
3. Na „Wszyscy” widać, kiedy może najwięcej osób.
4. Ustalasz termin, a każdy dodaje go do kalendarza.

<p align="center">
  <img src="docs/readme/create-390.png" width="190" alt="Tworzenie ankiety na telefonie">
  <img src="docs/readme/answer-390.png" width="190" alt="Zaznaczone godziny na telefonie">
  <img src="docs/readme/results-390.png" width="190" alt="Wyniki z najlepszym terminem na telefonie">
  <img src="docs/readme/settled-390.png" width="190" alt="Ustalony termin na telefonie">
</p>

<p align="center">
  <img src="docs/readme/drag.gif" width="480" alt="Przeciąganie po godzinach, fala na komórkach i „Zapisane”">
</p>

## Na komputerze

<p align="center">
  <img src="docs/readme/answer-1440.png" width="400" alt="Odpowiadanie na komputerze">
  <img src="docs/readme/results-1440.png" width="400" alt="Wyniki na komputerze">
</p>

<p align="center">
  <img src="docs/readme/settled-1440.png" alt="Ustalony termin na komputerze">
</p>

## Co umie

- Nikt nie zakłada konta, ani organizator, ani znajomi.
- Godziny zaznaczasz kliknięciem albo przeciągnięciem, także po północy.
- „Przypomnij” pisze wiadomość z imionami tych, którzy już odpowiedzieli.
- Ustalony termin trafia do kalendarza jako plik `.ics`.
- Link organizatora przenosi ankietę na drugi telefon.
- W czacie link pokazuje tytuł, dni, godziny i ile osób już odpowiedziało:

<p align="center">
  <img src="docs/readme/link-card.png" width="520" alt="Karta linku w czacie">
</p>

## Czego tu nie ma

Nie ma tu kont, powiadomień, komentarzy, ankiet cyklicznych, ciemnego motywu, wersji angielskiej ani analityki.

## Pod spodem

Next.js z App Routerem i server actions, TypeScript, SQLite przez Drizzle, TanStack Query do odświeżania, Tailwind v4 na własnych tokenach. Testy w Vitest i Playwright, na telefonie w Chromium i WebKit. Produkcja to jeden serwis na Railway z wolumenem na bazę.

## Uruchom u siebie

```sh
npm ci
npm run dev                  # http://localhost:3000
npm test
npm run build && npm run e2e
npm run readme:shots         # buduje aplikację i odświeża obrazki w docs/readme/
```

Baza ląduje w pliku z `DATABASE_PATH` (domyślnie `wpasuj.db` z `.env.development`).
