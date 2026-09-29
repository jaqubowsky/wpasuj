import { BrandMark } from "@/shared/ui/brand-mark/brand-mark";
import { PageFrame } from "@/shared/ui/page-frame/page-frame";
import type { ReactNode } from "react";

export function AppHeader({ aside }: { aside?: ReactNode }) {
  return (
    <header className="sticky top-0 z-2 bg-paper">
      <PageFrame wide>
        <div className="flex h-16 items-center justify-between lg:h-18">
          <BrandMark />
          {aside}
        </div>
      </PageFrame>
    </header>
  );
}
