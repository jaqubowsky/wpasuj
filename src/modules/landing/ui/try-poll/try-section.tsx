import { TryPoll } from "./try-poll";

export function TrySection() {
  return (
    <section
      aria-labelledby="try-heading"
      className="mx-auto box-border grid max-w-wide items-center gap-16 px-5 pt-30 pb-30 lg:grid-cols-[1fr_1.1fr] lg:px-12"
    >
      <div className="grid gap-5">
        <h2 id="try-heading" className="m-0 font-display text-5xl font-extrabold tracking-tighter text-balance lg:text-8xl">
          Kliknij,
          <br />
          kiedy <em className="text-accent-ink not-italic">możesz</em>
        </h2>
        <p className="m-0 max-w-90 text-lg text-muted lg:text-xl">
          Tak wygląda ankieta u Twoich znajomych. Pięć osób już odpowiedziało. Dołóż swoje godziny i patrz, jak przesuwa się najlepszy
          termin.
        </p>
      </div>
      <TryPoll />
    </section>
  );
}
