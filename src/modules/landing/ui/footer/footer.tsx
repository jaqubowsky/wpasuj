import { productName } from "@/shared/brand";

export function Footer() {
  return (
    <footer className="bg-ink px-5 lg:px-12">
      <div className="mx-auto box-border max-w-wide border-t border-paper/15 pt-6.5 pb-12 text-sm text-on-dark-muted">
        {productName}, darmowe ankiety terminów dla znajomych
      </div>
    </footer>
  );
}
