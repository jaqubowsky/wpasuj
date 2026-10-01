import { MotionToggle } from "@/shared/ui/motion-toggle/motion-toggle";
import { pitch } from "../../domain/pitch";
import { GoToFormButton } from "../go-to-form-button";
import "./hero.css";
import { HeroPosters } from "./hero-posters";
import { SwapWord } from "./swap-word";

export function Hero({ formId }: { formId: string }) {
  return (
    <section
      className="relative box-border grid place-content-center justify-items-center overflow-hidden px-4 pt-52 pb-56 text-center lg:pt-10 lg:pb-30"
      aria-labelledby="hero-heading"
      data-hero
    >
      <HeroPosters />
      <div className="relative grid justify-items-center gap-6.5">
        <h1 id="hero-heading" className="m-0 font-display text-5xl font-extrabold tracking-tightest text-balance lg:text-9xl">
          <span className="block">Kiedy się</span>
          <span className="block">widzimy na</span>
          <span className="block">
            <SwapWord />
          </span>
        </h1>
        <p className="m-0 max-w-90 text-lg text-balance text-muted lg:text-xl">{pitch}</p>
        <GoToFormButton formId={formId} variant="loud" data-report-pill-clear>
          Utwórz ankietę <span aria-hidden="true">→</span>
        </GoToFormButton>
        <span className="text-sm text-muted">Za darmo. Znajomi nie zakładają kont.</span>
        <MotionToggle />
      </div>
    </section>
  );
}
