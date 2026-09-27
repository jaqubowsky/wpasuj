import type { ElementType, ReactNode } from "react";

type Variant = "wordmark" | "title" | "best-time" | "day-number" | "heading" | "body" | "chip" | "button" | "meta";

type TextProps = {
  variant: Variant;
  as?: ElementType;
  children: ReactNode;
};

export function Text({ variant, as: Element = "span", children }: TextProps) {
  return (
    <Element className="m-[0] font-sans data-[variant=wordmark]:font-display data-[variant=wordmark]:font-extrabold data-[variant=wordmark]:text-day data-[variant=wordmark]:leading-[22px] data-[variant=wordmark]:tracking-[-0.03em] data-[variant=title]:font-display data-[variant=title]:font-bold data-[variant=title]:text-title data-[variant=title]:tracking-[-0.025em] data-[variant=best-time]:font-display data-[variant=best-time]:font-bold data-[variant=best-time]:text-best-time data-[variant=best-time]:tracking-[-0.025em] data-[variant=day-number]:font-display data-[variant=day-number]:font-bold data-[variant=day-number]:text-day data-[variant=day-number]:tracking-[-0.02em] data-[variant=heading]:font-display data-[variant=heading]:font-bold data-[variant=heading]:text-section data-[variant=heading]:tracking-[-0.01em] data-[variant=body]:text-body data-[variant=body]:font-regular data-[variant=chip]:text-body data-[variant=chip]:font-medium data-[variant=button]:text-button data-[variant=button]:font-semibold data-[variant=meta]:text-label data-[variant=meta]:font-medium data-[variant=meta]:text-muted lg:data-[variant=title]:text-title-desktop lg:data-[variant=best-time]:text-best-time-desktop" data-variant={variant}>
      {children}
    </Element>
  );
}
