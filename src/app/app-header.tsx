import { productName } from "@/shared/brand";
import { Text } from "@/shared/ui/text/text";
import type { ReactNode } from "react";
import styles from "./app-header.module.css";

export function AppHeader({ aside }: { aside?: ReactNode }) {
  return (
    <header className={styles.header}>
      <Text variant="wordmark">{productName}</Text>
      {aside}
    </header>
  );
}
