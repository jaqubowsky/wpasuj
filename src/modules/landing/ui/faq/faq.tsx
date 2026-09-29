import "./faq.css";
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
    <section aria-labelledby="faq-heading" className="mx-auto box-border max-w-wide px-5 pt-10 pb-15 lg:px-12">
      <h2 id="faq-heading" className="m-0 mb-9 text-center font-display text-5xl font-extrabold tracking-tighter lg:text-8xl">
        Pytania
      </h2>
      <div className="mx-auto grid max-w-190 gap-3">
        {questions.map(({ question, answer }) => (
          <details
            key={question}
            className="group rounded-card bg-surface px-5 py-4.5 shadow-[0_0_0_1px_var(--color-line)] open:shadow-[0_0_0_2px_var(--color-ink)]"
            data-faq
          >
            <summary className="flex cursor-pointer list-none justify-between gap-4 text-lg font-semibold">
              <span>{question}</span>
              <span
                aria-hidden="true"
                className="font-display text-2xl leading-none font-extrabold text-accent-ink transition-transform duration-(--duration-turn) ease-out group-open:rotate-180"
              >
                <span className="group-open:hidden">+</span>
                <span className="hidden group-open:inline">−</span>
              </span>
            </summary>
            <p className="m-0 pt-2.5 text-base text-muted">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
