import { GoToFormButton } from "../go-to-form-button";
import { TileWord } from "./tile-word";

export function Outro({ formId }: { formId: string }) {
  return (
    <section aria-labelledby="end-heading" className="bg-ink px-5 pt-27.5 pb-10 text-center text-paper">
      <h2 id="end-heading" className="m-0 font-display text-5xl font-extrabold tracking-tighter lg:text-8xl">
        To kiedy
        <br />
        się widzimy?
      </h2>
      <p className="mx-auto mt-4.5 mb-8.5 text-xl text-on-dark-muted">Grupa czeka na link.</p>
      <GoToFormButton formId={formId} variant="loud-light">
        Utwórz ankietę <span aria-hidden="true">→</span>
      </GoToFormButton>
      <TileWord />
    </section>
  );
}
