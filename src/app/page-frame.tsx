import type { ReactNode } from "react";

export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div data-page-frame className="mx-auto box-border w-full max-w-150 px-5 lg:pt-8">
      {children}
    </div>
  );
}
