import type { ComponentProps } from "react";

type ButtonProps = Omit<ComponentProps<"button">, "className"> & {
  variant?: "primary" | "danger" | "on-dark" | "text";
  size?: "small";
  block?: boolean;
};

export function Button({ variant, size, block, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className="box-border inline-flex h-13 cursor-pointer items-center justify-center gap-2 rounded-control border-0 bg-surface px-5 py-0 font-sans text-base font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-edge)] transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-default disabled:opacity-40 data-block:w-full data-[size=small]:h-11 data-[size=small]:px-3.5 data-[variant=danger]:bg-accent-ink data-[variant=danger]:text-surface data-[variant=danger]:shadow-none data-[variant=on-dark]:shadow-none data-[variant=primary]:bg-ink data-[variant=primary]:text-surface data-[variant=primary]:shadow-none data-[variant=text]:h-auto data-[variant=text]:min-h-11 data-[variant=text]:bg-transparent data-[variant=text]:px-0 data-[variant=text]:py-3 data-[variant=text]:font-medium data-[variant=text]:text-muted data-[variant=text]:underline data-[variant=text]:underline-offset-3 data-[variant=text]:shadow-none motion-safe:enabled:active:scale-97"
      data-variant={variant}
      data-size={size}
      data-block={block || undefined}
      {...props}
    />
  );
}
