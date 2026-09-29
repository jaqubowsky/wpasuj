import { BrandMark } from "@/shared/ui/brand-mark/brand-mark";
import type { ReactNode } from "react";

export function AppHeader({ aside }: { aside?: ReactNode }) {
  return (
    <header className="flex h-14 items-center justify-between">
      <BrandMark />
      {aside}
    </header>
  );
}
