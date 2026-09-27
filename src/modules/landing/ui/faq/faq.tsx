const questions = [
  {
    question: "Czy znajomi muszą coś instalować albo zakładać konto?",
    answer: "Nie. Otwierają link prosto z Messengera czy WhatsAppa, wpisują imię i klikają godziny.",
  },
  {
    question: "A jak ktoś otworzy link na innym telefonie?",
    answer: "Wpisuje to samo imię, a Wpasuj pyta „To ty?”. Po potwierdzeniu zmienia dalej swoje godziny.",
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
      className="mx-auto box-border flex max-w-[1280px] flex-col gap-6 px-5 py-[80px] lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-[56px] lg:px-[48px] lg:py-[60px]"
    >
      <h2 id="faq-heading" className="m-[0] font-display text-title font-extrabold tracking-[-0.03em] lg:text-faq-heading">
        Pytania
      </h2>
      <div>
        {questions.map(({ question, answer }) => (
          <details key={question} className="group border-t border-line last:border-b">
            <summary className="cursor-pointer py-[18px] font-display text-question font-bold tracking-[-0.03em] group-open:pb-[10px]">
              {question}
            </summary>
            <p className="m-[0] max-w-[60ch] pb-[18px] text-body text-muted">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
