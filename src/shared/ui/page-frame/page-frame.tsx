import type { ReactNode } from "react";

export function PageFrame({ wide, children }: { wide?: boolean; children: ReactNode }) {
  return (
    <div className="mx-auto box-border w-full max-w-150 px-5 data-wide:lg:max-w-280 data-wide:lg:px-10" data-wide={wide || undefined}>
      {children}
    </div>
  );
}
