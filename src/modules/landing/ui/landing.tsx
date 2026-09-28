import { productName } from "@/shared/brand";
import { Text } from "@/shared/ui/text/text";
import type { ReactNode } from "react";
import { headline, pitch } from "../domain/pitch";
import { Faq } from "./faq/faq";
import { Footer } from "./footer/footer";
import { GoToFormButton } from "./go-to-form-button";
import { LazyDemo, LazyStory } from "./lazy-sections";
import { WebApplicationJsonLd } from "./web-application-json-ld";

const formId = "utworz";

const reasons = [
  {
    figure: "0",
    heading: "kont i maili",
    body: "Nikt nie rejestruje się, żeby odpowiedzieć. Imię wystarczy, a telefon je zapamięta.",
  },
  {
    figure: "20 s",
    heading: "na odpowiedź",
    body: "Link z Messengera, kilka tapnięć, gotowe. Szybciej niż przewinąć grupę.",
  },
  {
    figure: "1",
    heading: "najlepszy termin",
    body: "Nie liczysz, kto kiedy może. Widzisz wynik od razu i dwa zapasowe terminy.",
  },
];

export function Landing({ hero, home }: { hero: ReactNode; home: URL }) {
  return (
    <>
      <WebApplicationJsonLd home={home} />
      <header className="sticky top-0 z-1 box-border flex h-18 items-center justify-between bg-paper px-5 lg:px-12">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="grid grid-cols-[repeat(2,--spacing(2))] gap-0.5">
            <span className="h-2 rounded-[2px] bg-accent" />
            <span className="h-2 rounded-[2px] bg-tint-coral" />
            <span className="h-2 rounded-[2px] bg-tint-coral" />
            <span className="h-2 rounded-[2px] bg-accent" />
          </span>
          <Text variant="wordmark">{productName}</Text>
        </div>
        <GoToFormButton formId={formId}>Utwórz ankietę</GoToFormButton>
      </header>
      <main>
        <section
          className="mx-auto box-border flex max-w-wide flex-col gap-6 px-5 pt-4 pb-10 lg:grid lg:grid-cols-[minmax(0,1fr)_520px] lg:items-center lg:gap-16 lg:px-12 lg:pt-10"
          aria-labelledby="hero-heading"
        >
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-accent-ink">{productName}</span>
            <h1 id="hero-heading" className="m-0 font-display font-extrabold tracking-tightest text-balance text-4xl lg:text-7xl">
              {headline}
            </h1>
            <p className="m-0 max-w-150 text-lg text-muted lg:text-xl">
              {pitch}
            </p>
          </div>
          <div id={formId} className="scroll-mt-18">
            {hero}
          </div>
        </section>
        <LazyStory />
        <LazyDemo formId={formId} />
        <section
          className="mx-auto box-border max-w-wide px-5 py-20 [contain-intrinsic-size:auto_640px] [content-visibility:auto] lg:px-12"
          aria-labelledby="reasons-heading"
        >
          <h2 id="reasons-heading" className="m-0 mb-8 max-w-narrow font-display font-extrabold tracking-tightest text-balance text-3xl animate-rise [animation-range:entry_0%_cover_30%] [animation-timeline:view()] lg:mb-9 lg:text-5xl">
            Zrobione pod paczkę znajomych, nie pod firmę.
          </h2>
          <ul className="m-0 grid list-none gap-4 p-0 lg:grid-cols-3">
            {reasons.map((reason) => (
              <li key={reason.figure} className="rounded-card bg-surface p-6 animate-rise [animation-range:entry_0%_cover_30%] [animation-timeline:view()] lg:p-8">
                <b className="m-0 mb-4 block font-display font-extrabold tracking-tightest text-balance text-accent-ink text-6xl">{reason.figure}</b>
                <h3 className="m-0 mb-2 font-display font-bold tracking-tighter text-balance text-2xl">{reason.heading}</h3>
                <p className="m-0 text-muted">{reason.body}</p>
              </li>
            ))}
          </ul>
        </section>
        <Faq />
        <section
          className="mx-auto box-border flex max-w-wide flex-col gap-8 px-5 py-20 [contain-intrinsic-size:auto_640px] [content-visibility:auto] lg:grid lg:grid-cols-[minmax(0,1fr)_480px] lg:items-center lg:gap-16 lg:px-12 lg:py-30"
          aria-labelledby="end-heading"
        >
          <h2 id="end-heading" className="m-0 font-display font-extrabold tracking-tightest text-balance text-4xl animate-rise [animation-range:entry_0%_cover_30%] [animation-timeline:view()] lg:text-7xl">
            To kiedy się widzicie?
          </h2>
          <div className="flex flex-col gap-3 text-center animate-rise [animation-range:entry_0%_cover_30%] [animation-timeline:view()]">
            <GoToFormButton formId={formId}>Utwórz ankietę</GoToFormButton>
            <Text variant="meta">Za darmo. Znajomi nie zakładają kont.</Text>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
