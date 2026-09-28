import { productName } from "@/shared/brand";

const questions = [
  {
    question: "Czy znajomi muszą coś instalować albo zakładać konto?",
    answer: "Nie. Otwierają link prosto z Messengera czy WhatsAppa, wpisują imię i klikają godziny.",
  },
  {
    question: "A jak ktoś otworzy link na innym telefonie?",
    answer: `Wpisuje to samo imię, a ${productName} pyta „To ty?”. Po potwierdzeniu zmienia dalej swoje godziny.`,
  },
  {
    question: "Ile to kosztuje?",
    answer: "Nic. Bez reklam i bez płatnej wersji.",
  },
  {
    question: "Co się dzieje z danymi?",
    answer: "Zapisujemy tylko imiona i zaznaczone godziny. Ankieta znika sama 60 dni po ostatnim terminie.",
  },
];

export function Faq() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="mx-auto box-border flex max-w-wide flex-col gap-6 px-5 py-20 lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-14 lg:px-12 lg:py-15"
    >
      <h2 id="faq-heading" className="m-0 animate-rise [animation-range:entry_0%_cover_30%] [animation-timeline:view()] font-display text-3xl font-extrabold tracking-tightest lg:text-4xl">
        Pytania
      </h2>
      <div className="animate-rise [animation-range:entry_0%_cover_30%] [animation-timeline:view()]">
        {questions.map(({ question, answer }) => (
          <details key={question} className="group border-t border-line last:border-b">
            <summary className="cursor-pointer py-4.5 font-display text-xl font-bold tracking-tightest group-open:pb-2.5">
              {question}
            </summary>
            <p className="m-0 max-w-165 pb-4.5 text-base text-muted">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
