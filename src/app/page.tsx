import { productName } from "@/shared/brand";
import { Text } from "@/shared/ui/text/text";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <Text as="h1" variant="wordmark">
        {productName}
      </Text>
      <Text as="p" variant="body">
        Wspólny termin dla paczki znajomych, w minutę i bez kont.
      </Text>
    </main>
  );
}
