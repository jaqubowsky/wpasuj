import { Text } from "@/shared/ui/text/text";
import Link from "next/link";
import { AppHeader } from "../../app-header";
import frame from "../../page-frame.module.css";
import styles from "./not-found.module.css";

export default function PollGone() {
  return (
    <div className={frame.frame}>
      <AppHeader />
      <main className={styles.main}>
        <Text as="h1" variant="title">
          Tej ankiety już nie ma
        </Text>
        <Text as="p" variant="body">
          Organizator mógł ją usunąć albo jej terminy minęły dawno temu.
        </Text>
        <Link href="/" className={styles.create}>
          Zrób nową ankietę
        </Link>
      </main>
    </div>
  );
}
