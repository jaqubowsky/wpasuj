import { productName } from "@/shared/brand";

export function Footer() {
  return (
    <footer className="mx-auto box-border max-w-wide border-t border-line px-5 pt-7 pb-12 text-sm text-muted lg:px-12">
      {productName}, darmowe ankiety terminów dla znajomych
    </footer>
  );
}
