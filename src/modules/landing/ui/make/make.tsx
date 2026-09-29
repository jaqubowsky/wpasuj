import type { ReactNode } from "react";

export function Make({ formId, form, preview }: { formId: string; form: ReactNode; preview: ReactNode }) {
  return (
    <section
      aria-labelledby="form-heading"
      className="mx-auto box-border grid max-w-wide items-start gap-10 px-5 pt-30 pb-22.5 lg:grid-cols-2 lg:gap-16 lg:px-12"
    >
      <div className="grid gap-5 lg:sticky lg:top-22.5">
        <h2 id="form-heading" className="m-0 font-display text-5xl font-extrabold tracking-tighter lg:text-8xl">
          Twoja
          <br />
          kolej
        </h2>
        <p className="m-0 max-w-75 text-xl text-muted">Minuta na ankietę. Tak zobaczą ją znajomi na grupie:</p>
        <div className="mt-2.5 max-w-90 -rotate-2">{preview}</div>
      </div>
      <div id={formId} className="scroll-mt-18">
        {form}
      </div>
    </section>
  );
}
