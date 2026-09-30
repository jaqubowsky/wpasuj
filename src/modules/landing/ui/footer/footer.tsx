import { productName } from "@/shared/brand";
import { SiteLinks } from "@/shared/ui/site-links/site-links";

export function Footer() {
  return (
    <footer className="bg-ink px-5 lg:px-12">
      <div className="mx-auto box-border flex max-w-wide flex-col items-center gap-3 border-t border-paper/15 pt-6.5 pb-12 text-sm text-on-dark-muted lg:flex-row lg:justify-between lg:pb-17">
        <p className="m-0 text-center">{productName}, darmowe ankiety terminów dla znajomych</p>
        <SiteLinks tone="on-dark" />
      </div>
    </footer>
  );
}
