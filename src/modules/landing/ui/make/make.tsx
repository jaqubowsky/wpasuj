import type { ReactNode } from "react";

export function Make({ formId, form }: { formId: string; form: ReactNode }) {
  return (
    <section
      aria-labelledby="form-heading"
      className="mx-auto box-border grid max-w-narrow grid-cols-1 gap-6 px-5 pt-30 pb-22.5 lg:box-content lg:px-12"
    >
      <h2 id="form-heading" className="m-0 font-sans text-base font-semibold">
        Twoja kolej
      </h2>
      <div id={formId}>{form}</div>
    </section>
  );
}
