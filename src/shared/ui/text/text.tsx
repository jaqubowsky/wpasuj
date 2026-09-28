import type { ElementType, ReactNode } from "react";

type Variant = "wordmark" | "title" | "best-time" | "day-number" | "heading" | "body" | "chip" | "button" | "meta";

type TextProps = {
  variant: Variant;
  as?: ElementType;
  children: ReactNode;
};

export function Text({ variant, as: Element = "span", children }: TextProps) {
  return (
    <Element
      className="m-0 font-sans data-[variant=best-time]:font-display data-[variant=best-time]:text-3xl data-[variant=best-time]:font-bold data-[variant=best-time]:tracking-tightest data-[variant=body]:text-base data-[variant=body]:font-regular data-[variant=button]:text-base data-[variant=button]:font-semibold data-[variant=chip]:text-base data-[variant=chip]:font-medium data-[variant=day-number]:font-display data-[variant=day-number]:text-xl data-[variant=day-number]:font-bold data-[variant=day-number]:tracking-tighter data-[variant=heading]:font-display data-[variant=heading]:text-lg data-[variant=heading]:font-bold data-[variant=heading]:tracking-tight data-[variant=meta]:text-sm data-[variant=meta]:font-medium data-[variant=meta]:text-muted data-[variant=title]:font-display data-[variant=title]:text-3xl data-[variant=title]:font-bold data-[variant=title]:tracking-tightest data-[variant=wordmark]:font-display data-[variant=wordmark]:text-xl data-[variant=wordmark]:font-extrabold data-[variant=wordmark]:tracking-tightest lg:data-[variant=title]:text-4xl"
      data-variant={variant}
    >
      {children}
    </Element>
  );
}
