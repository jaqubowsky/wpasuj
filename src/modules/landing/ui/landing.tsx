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
      <header className="sticky top-[0] z-1 box-border flex h-[72px] items-center justify-between bg-paper px-5 lg:px-[48px]">
        <div className="flex items-center gap-[10px]">
          <span aria-hidden className="grid grid-cols-[repeat(2,var(--spacing-2))] gap-[2px]">
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
          className="mx-auto box-border flex max-w-[1280px] flex-col gap-6 px-5 pt-4 pb-10 lg:grid lg:grid-cols-[minmax(0,1fr)_520px] lg:items-center lg:gap-[64px] lg:px-[48px] lg:pt-10"
          aria-labelledby="hero-heading"
        >
          <div className="flex flex-col gap-3">
            <span className="text-bubble font-semibold text-accent-ink">{productName}</span>
            <h1 id="hero-heading" className="m-[0] font-display font-extrabold tracking-[-0.03em] text-balance text-title-desktop/[42px] lg:[font-size:84px] lg:leading-[84px]">
              {headline}
            </h1>
            <p className="m-[0] max-w-[30em] text-section/[28px] text-muted lg:text-story-lead">
              {pitch}
            </p>
          </div>
          <div id={formId} className="scroll-mt-[72px]">
            {hero}
          </div>
        </section>
        <LazyStory />
        <LazyDemo formId={formId} />
        <section
          className="mx-auto box-border max-w-[1280px] px-5 py-[80px] [contain-intrinsic-size:auto_640px] [content-visibility:auto] lg:px-[48px]"
          aria-labelledby="reasons-heading"
        >
          <h2 id="reasons-heading" className="m-[0] mb-8 max-w-[720px] font-display font-extrabold tracking-[-0.03em] text-balance text-display animate-rise [animation-range:entry_0%_cover_30%] [animation-timeline:view()] lg:mb-[36px] lg:text-display-desktop">
            Zrobione pod paczkę znajomych, nie pod firmę.
          </h2>
          <ul className="m-[0] grid list-none gap-4 p-[0] lg:grid-cols-3">
            {reasons.map((reason) => (
              <li key={reason.figure} className="rounded-card bg-surface p-6 animate-rise [animation-range:entry_0%_cover_30%] [animation-timeline:view()] lg:p-8">
                <b className="m-[0] mb-4 block font-display font-extrabold tracking-[-0.03em] text-balance text-accent-ink [font-size:56px] leading-[56px] lg:[font-size:64px] lg:leading-[64px]">{reason.figure}</b>
                <h3 className="m-[0] mb-2 font-display font-bold tracking-[-0.02em] text-balance [font-size:24px] leading-[30px]">{reason.heading}</h3>
                <p className="m-[0] text-muted">{reason.body}</p>
              </li>
            ))}
          </ul>
        </section>
        <Faq />
        <section
          className="mx-auto box-border flex max-w-[1280px] flex-col gap-8 px-5 py-[80px] [contain-intrinsic-size:auto_640px] [content-visibility:auto] lg:grid lg:grid-cols-[minmax(0,1fr)_480px] lg:items-center lg:gap-[64px] lg:px-[48px] lg:py-[120px]"
          aria-labelledby="end-heading"
        >
          <h2 id="end-heading" className="m-[0] font-display font-extrabold tracking-[-0.03em] text-balance text-faq-heading/[46px] animate-rise [animation-range:entry_0%_cover_30%] [animation-timeline:view()] lg:[font-size:84px] lg:leading-[84px]">
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
