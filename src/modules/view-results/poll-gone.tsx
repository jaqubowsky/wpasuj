import { Text } from "@/shared/ui/text/text";
import Link from "next/link";
import styles from "./poll-gone.module.css";

export function PollGone() {
  return (
    <div className={styles.gone}>
      <Text as="h2" variant="heading">
        Tej ankiety już nie ma
      </Text>
      <Text as="p" variant="body">
        Organizator mógł ją usunąć albo jej terminy minęły dawno temu.
      </Text>
      <Link href="/" className={styles.create}>
        Zrób nową ankietę
      </Link>
    </div>
  );
}
