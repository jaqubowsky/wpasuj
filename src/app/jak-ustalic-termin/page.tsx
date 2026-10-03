import { productName } from "@/shared/brand";
import { siteUrl } from "@/shared/site-url";
import { PageFrame } from "@/shared/ui/page-frame/page-frame";
import { PollPoster } from "@/shared/ui/poll-poster/poll-poster";
import { SiteLinks } from "@/shared/ui/site-links/site-links";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import type { Article, HowTo, WithContext } from "schema-dts";
import { AppHeader } from "../app-header";
import createScreenshot from "./create.png";
import answerScreenshot from "./answer.png";
import resultsScreenshot from "./results.png";

const title = "Jak ustalić termin spotkania ze znajomymi";

const description =
  "Czat, jedna propozycja czy ankieta? Porównaj trzy sposoby na ustalenie terminu ze znajomymi i zobacz, jak zebrać wolne godziny we Wpasuj.";

const path = "/jak-ustalic-termin";

const steps = [
  {
    id: "zaloz-ankiete",
    title: "1. Zaproponuj dni i godziny",
    text: "We Wpasuj wpisz, co robicie, na przykład Grill na działce u Oli. Zaznacz kilka dni, które naprawdę wchodzą w grę, i przedział godzin. Możesz wybrać Ten weekend albo kliknąć konkretne daty. Wpisz swoje imię. Przycisk Utwórz i wyślij na grupę tworzy ankietę i otwiera udostępnianie albo kopiuje link. Nikt nie musi zakładać konta. Zacznij od niewielu propozycji, zamiast pytać o cały miesiąc.",
    image: createScreenshot,
    alt: "Formularz Wpasuj z tytułem Grill na działce u Oli, wybranymi dniami i godzinami",
    caption: "Tworzenie ankiety. Najpierw wybierasz dni i zakres godzin.",
  },
  {
    id: "wyslij-link",
    title: "2. Wyślij jeden link na grupę",
    text: "Wklej link do czatu, w którym już rozmawiacie. Dopisz, do kiedy zbierasz odpowiedzi, na przykład: Zaznaczcie godziny do jutra wieczorem, potem wybierzemy termin. To wasza umowa, nie automatyczny termin zamknięcia ankiety. Nie wysyłaj każdemu innego zestawu dat. Link do odpowiadania jest wspólny, więc wszyscy widzą te same propozycje. Osobny link organizatora zachowaj dla siebie, bo daje możliwość ustalenia terminu i usunięcia ankiety.",
  },
  {
    id: "zaznacz-godziny",
    title: "3. Zaznaczcie, kiedy możecie",
    text: "Każdy otwiera link, wpisuje imię i na karcie Moje klika wolne godziny. Zaznacz cały czas, w którym możesz przyjść, a nie tylko ulubioną porę. Zmiany zapisują się automatycznie. Na telefonie możesz przytrzymać komórkę i przeciągnąć po kilku godzinach. Jeśli żaden termin nie pasuje, wybierz Nie mogę w żadnym terminie. Organizator też odpowiada. Przed wyjściem ze strony sprawdź, czy zapis się udał; przy błędzie użyj Spróbuj ponownie.",
    image: answerScreenshot,
    alt: "Karta Moje we Wpasuj z zaznaczonymi wolnymi godzinami Zuzy",
    caption: "Odpowiedź jednej osoby. Kolor oznacza jej wolne godziny.",
  },
  {
    id: "porownaj-odpowiedzi",
    title: "4. Sprawdź kartę Wszyscy",
    text: "Wyniki pokazują, kiedy może najwięcej osób. Liczby w komórkach mówią, ile osób zaznaczyło daną godzinę. Kliknij godzinę, żeby zobaczyć imiona tych, którzy mogą i tych, którzy nie mogą. Najlepsza propozycja nie zawsze pasuje wszystkim. Jeśli kogoś brakuje, użyj Przypomnij i wyślij wiadomość na grupę. Gdy żaden wspólny czas nie wychodzi, zapytaj o inne dni, zamiast traktować najwyższy wynik jako zgodę całej grupy.",
    image: resultsScreenshot,
    alt: "Karta Wszyscy we Wpasuj z najlepszym terminem i liczbą dostępnych osób w każdej godzinie",
    caption: "Wyniki przykładowej ankiety. Najlepszy termin jest nad siatką godzin.",
  },
  {
    id: "ustal-termin",
    title: "5. Ustal termin i daj znać",
    text: "Gdy zbierzecie odpowiedzi, organizator zatwierdza propozycję przyciskiem Ustal termin. Ankieta pokazuje wtedy ustalony czas, a odpowiadanie się zamyka. Napisz też na czacie, gdzie się widzicie i o której, żeby nikt nie musiał szukać wiadomości z adresem. Każdy może dodać spotkanie do kalendarza. Jeśli plany się zmienią, organizator może użyć Zmień termin i ponownie otworzyć odpowiadanie. Sam wynik ankiety nie rezerwuje miejsca ani nie wysyła znajomym powiadomienia.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  await connection();

  return {
    metadataBase: siteUrl(),
    title: `${title} · ${productName}`,
    description,
    alternates: { canonical: path },
    openGraph: { type: "article", title, description, url: path, locale: "pl_PL" },
  };
}

export default async function MeetingGuidePage() {
  await connection();

  const site = siteUrl();
  const url = new URL(path, site).href;

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${url}#instrukcja`,
    name: "Jak ustalić termin za pomocą ankiety Wpasuj",
    inLanguage: "pl",
    step: steps.map((step) => ({
      "@type": "HowToStep",
      name: step.title,
      text: step.text,
      url: `${url}#${step.id}`,
      ...(step.image ? { image: new URL(step.image.src, site).href } : {}),
    })),
  } satisfies WithContext<HowTo>;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: "pl",
    url,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: productName, url: new URL("/", site).href },
    image: [createScreenshot, answerScreenshot, resultsScreenshot].map((image) => new URL(image.src, site).href),
    mainEntity: { "@id": howTo["@id"] },
  } satisfies WithContext<Article>;

  return (
    <>
      <script type="application/ld+json">{JSON.stringify([article, howTo]).replace(/</g, "\\u003c")}</script>
      <AppHeader />
      <PollPoster tone="ink" eyebrow={<span className="pl-2.5">Poradnik</span>} title={title} />
      <PageFrame>
        <main className="pt-6 pb-10 lg:pt-10">
          <article className="grid gap-8 text-base">
            <section className="grid gap-3" aria-labelledby="czat">
              <h2 id="czat" className="m-0 font-display text-2xl font-bold tracking-tight">
                Dlaczego rozmowa na grupie stoi w miejscu
              </h2>
              <p className="m-0">
                Ktoś rzuca: Może w piątek? Jedna osoba odpisuje, że może dopiero po pracy, druga proponuje sobotę, a trzecia czyta
                wiadomości wieczorem. Zanim odpowie, rozmowa dotyczy już czegoś innego. Trudno odróżnić luźny pomysł od konkretnej
                propozycji i zapamiętać, kto kiedy może.
              </p>
              <p className="m-0">
                Zanim zaczniecie wybierać, ustalcie, co robicie i ile czasu potrzebujecie. Kolacja po pracy wymaga innego okna niż
                całodniowy wypad. Wybierz jedną osobę, która zbierze odpowiedzi i ogłosi decyzję. Warto też od razu powiedzieć, czy szukacie
                terminu dla wszystkich, czy spotykacie się w mniejszym składzie.
              </p>
            </section>
            <section className="grid gap-3" aria-labelledby="sposoby">
              <h2 id="sposoby" className="m-0 font-display text-2xl font-bold tracking-tight">
                Trzy sposoby na ustalenie terminu
              </h2>
              <h3 className="m-0 font-display text-lg font-bold">Rozmowa na czacie</h3>
              <p className="m-0">
                Sprawdza się, gdy jest was niewiele i możecie odpowiedzieć od razu. Zapytaj o konkretny dzień i godzinę, zamiast pisać
                ogólne Kiedy się widzimy? Jeśli pojawią się kolejne propozycje, podsumuj je w jednej wiadomości. Inaczej każda osoba
                odpowiada na inny fragment rozmowy.
              </p>
              <h3 className="m-0 font-display text-lg font-bold">Jeden termin do potwierdzenia</h3>
              <p className="m-0">
                Podaj dzień, godzinę i miejsce, a potem poproś o odpowiedź tak lub nie. To pasuje do spotkania, którego termin jest mało
                elastyczny. Minusem jest to, że odmowa nie mówi, kiedy dana osoba mogłaby przyjść. Jeżeli zależy wam na pełnym składzie,
                trzeba wrócić z nową propozycją.
              </p>
              <h3 className="m-0 font-display text-lg font-bold">Ankieta z kilkoma dniami</h3>
              <p className="m-0">
                Przy różnych grafikach zbierz dostępność w jednym miejscu. Każdy zaznacza swoje wolne godziny, a ty porównujesz odpowiedzi,
                zamiast przepisywać je z czatu. Ankieta nie rozstrzygnie za was, czy spotkanie ma się odbyć bez jednej osoby. Pozwala za to
                zobaczyć, kogo dotyczy taki wybór.
              </p>
            </section>
            <section id="instrukcja" className="grid gap-6" aria-labelledby="ankieta">
              <h2 id="ankieta" className="m-0 font-display text-2xl font-bold tracking-tight">
                Ankieta Wpasuj krok po kroku
              </h2>
              {steps.map((step) => (
                <section key={step.id} id={step.id} className="grid gap-3" aria-labelledby={`${step.id}-tytul`}>
                  <h3 id={`${step.id}-tytul`} className="m-0 font-display text-lg font-bold">
                    {step.title}
                  </h3>
                  <p className="m-0">{step.text}</p>
                  {step.image && (
                    <figure className="m-0 grid gap-2">
                      <Image src={step.image} alt={step.alt} sizes="320px" className="mx-auto h-auto w-full max-w-80 rounded-card" />
                      <figcaption className="text-sm text-muted">{step.caption}</figcaption>
                    </figure>
                  )}
                </section>
              ))}
            </section>
            <Link
              href="/#utworz"
              className="box-border inline-flex min-h-13 items-center justify-center rounded-control bg-ink px-5 py-3 font-semibold text-surface no-underline shadow-ledge shadow-heat-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Utwórz ankietę
            </Link>
          </article>
        </main>
      </PageFrame>
      <footer className="flex justify-center pb-8">
        <SiteLinks />
      </footer>
    </>
  );
}
