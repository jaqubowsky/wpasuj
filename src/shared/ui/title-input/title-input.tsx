import { Morph } from "@/shared/morph";
import { useId, type ComponentProps } from "react";
import { useTypingBeforeHydration } from "../input/use-typing-before-hydration";

type TitleInputProps = Omit<ComponentProps<"textarea">, "aria-invalid" | "aria-describedby" | "className" | "id" | "rows" | "onKeyDown"> & {
  label: string;
  error?: string;
  morph?: string;
};

export function TitleInput({ label, error, morph, ref, onChange, ...props }: TitleInputProps) {
  const fieldId = useId();
  const errorId = useId();
  const field = useTypingBeforeHydration(ref);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="sr-only">
        {label}
      </label>
      <Morph name={morph}>
        <textarea
          ref={field}
          id={fieldId}
          rows={1}
          className="m-0 box-border block field-sizing-content w-full resize-none overflow-hidden rounded-none border-0 bg-transparent px-0 pt-0 pb-3 font-display text-5xl font-extrabold tracking-tightest text-ink shadow-[inset_0_-5px_0_var(--color-ink)] placeholder:text-muted focus:shadow-[inset_0_-7px_0_var(--color-ink)] focus:outline-none aria-invalid:not-focus:shadow-[inset_0_-5px_0_var(--color-accent-ink)] lg:text-8xl"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
          onChange={(event) => {
            event.target.value = event.target.value.replace(/\s*[\r\n]+\s*/g, " ");
            onChange?.(event);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;

            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }}
        />
      </Morph>
      {error && (
        <small id={errorId} className="text-sm font-medium text-accent-ink">
          {error}
        </small>
      )}
    </div>
  );
}
