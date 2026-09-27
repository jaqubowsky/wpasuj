import { productName } from "@/shared/brand";
import { Text } from "@/shared/ui/text/text";
import type { ReactNode } from "react";

export function AppHeader({ aside }: { aside?: ReactNode }) {
  return (
    <header className="flex h-14 items-center justify-between">
      <Text variant="wordmark">{productName}</Text>
      {aside}
    </header>
  );
}
