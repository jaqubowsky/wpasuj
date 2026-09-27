import { productName } from "@/shared/brand";

export function Footer() {
  return (
    <footer className="mx-auto box-border max-w-[1280px] border-t border-line px-5 pt-[28px] pb-[48px] text-footer text-muted lg:px-[48px]">
      {productName}, darmowe ankiety terminów dla znajomych
    </footer>
  );
}
