import { BrandMark } from "@/shared/ui/brand-mark/brand-mark";
import type { ReactNode } from "react";

export function AppHeader({ aside }: { aside?: ReactNode }) {
  return (
    <header className="sticky top-0 z-2 bg-paper">
      <div className="mx-auto box-border flex h-16 max-w-150 items-center justify-between px-5 lg:h-18 lg:max-w-280 lg:px-10">
        <BrandMark />
        {aside}
      </div>
    </header>
  );
}
