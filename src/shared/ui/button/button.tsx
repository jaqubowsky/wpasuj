import type { ComponentProps } from "react";

type ButtonProps = Omit<ComponentProps<"button">, "className"> & {
  variant?: "primary" | "loud" | "loud-light" | "danger" | "on-dark" | "text";
  size?: "small";
  block?: boolean;
};

export function Button({ variant, size, block, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className="box-border inline-flex h-13 cursor-pointer items-center justify-center gap-2 rounded-control border-0 bg-surface px-5 py-0 font-sans text-base font-semibold text-ink shadow-ledge inset-ring-2 shadow-ink inset-ring-ink transition-[translate,scale,box-shadow] duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-default disabled:opacity-40 aria-pressed:bg-ink aria-pressed:text-surface aria-pressed:inset-ring-0 aria-pressed:shadow-heat-5 data-block:w-full data-[size=small]:h-11 data-[size=small]:px-3.5 data-[size=small]:shadow-ledge-sm data-[variant=danger]:bg-accent-ink data-[variant=danger]:text-surface data-[variant=danger]:inset-ring-0 data-[variant=loud]:h-14 data-[variant=loud]:bg-ink data-[variant=loud]:px-7 data-[variant=loud]:text-lg data-[variant=loud]:text-surface data-[variant=loud]:inset-ring-0 data-[variant=loud]:shadow-heat-5 data-[variant=loud-light]:h-14 data-[variant=loud-light]:bg-paper data-[variant=loud-light]:px-7 data-[variant=loud-light]:text-lg data-[variant=loud-light]:inset-ring-0 data-[variant=loud-light]:shadow-accent data-[variant=on-dark]:inset-ring-0 data-[variant=on-dark]:shadow-accent data-[variant=primary]:bg-ink data-[variant=primary]:text-surface data-[variant=primary]:inset-ring-0 data-[variant=primary]:shadow-heat-5 data-[variant=text]:h-auto data-[variant=text]:min-h-11 data-[variant=text]:bg-transparent data-[variant=text]:px-0 data-[variant=text]:py-3 data-[variant=text]:font-medium data-[variant=text]:text-muted data-[variant=text]:underline data-[variant=text]:underline-offset-3 data-[variant=text]:shadow-none data-[variant=text]:inset-ring-0 motion-safe:enabled:not-data-[variant=text]:hover:-translate-y-0.5 motion-safe:enabled:not-data-[variant=text]:hover:shadow-ledge-up motion-safe:enabled:not-data-[variant=text]:active:translate-y-1.5 motion-safe:enabled:not-data-[variant=text]:active:shadow-ledge-down motion-safe:enabled:data-[size=small]:hover:shadow-ledge-sm-up motion-safe:enabled:data-[size=small]:active:translate-y-1 motion-safe:enabled:data-[size=small]:active:shadow-ledge-sm-down motion-safe:enabled:data-[variant=text]:active:scale-97"
      data-variant={variant}
      data-size={size}
      data-block={block || undefined}
      {...props}
    />
  );
}
