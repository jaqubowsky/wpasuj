import { productName } from "@/shared/brand";
import { Text } from "@/shared/ui/text/text";
import type { ReactNode } from "react";
import { GoToFormButton } from "./go-to-form-button";
import styles from "./landing.module.css";
import { LazyDemo, LazyStory } from "./lazy-sections";

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

export function Landing({ hero }: { hero: ReactNode }) {
  return (
    <>
      <header className={styles.header}>
        <Text variant="wordmark">{productName}</Text>
        <GoToFormButton formId={formId}>Utwórz ankietę</GoToFormButton>
      </header>
      <main>
        <section className={styles.hero} aria-labelledby="hero-heading">
          <div className={styles.lead}>
            <h1 id="hero-heading" className={styles.headline}>
              Kiedy się widzimy? Ustalcie to w minutę.
            </h1>
            <p className={styles.line}>
              Wrzucasz jeden link na grupę, każdy klika godziny, kiedy może. Najlepszy termin wyskakuje sam.
            </p>
          </div>
          <div id={formId} className={styles.form}>
            {hero}
          </div>
        </section>
        <LazyStory />
        <LazyDemo formId={formId} />
        <section className={styles.reasons} aria-labelledby="reasons-heading">
          <h2 id="reasons-heading" className={`${styles.heading} ${styles.rise}`}>
            Zrobione pod paczkę znajomych, nie pod firmę.
          </h2>
          <ul className={styles.cards}>
            {reasons.map((reason) => (
              <li key={reason.figure} className={`${styles.card} ${styles.rise}`}>
                <b className={styles.figure}>{reason.figure}</b>
                <h3 className={styles.reason}>{reason.heading}</h3>
                <p className={styles.body}>{reason.body}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className={styles.end} aria-labelledby="end-heading">
          <h2 id="end-heading" className={`${styles.call} ${styles.rise}`}>
            To kiedy się widzicie?
          </h2>
          <div className={`${styles.start} ${styles.rise}`}>
            <GoToFormButton formId={formId}>Utwórz ankietę</GoToFormButton>
            <Text variant="meta">Za darmo. Znajomi nie zakładają kont.</Text>
          </div>
        </section>
      </main>
    </>
  );
}
