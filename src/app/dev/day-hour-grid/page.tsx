import { notFound } from "next/navigation";
import { Text } from "@/shared/ui/text/text";
import { GridDemo } from "./grid-demo";
import styles from "./page.module.css";

const week = ["2026-10-16", "2026-10-17", "2026-10-18", "2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22"];
const hours = Array.from({ length: 13 }, (_, index) => 10 + index);

export default async function DayHourGridDemo({ searchParams }: PageProps<"/dev/day-hour-grid">) {
  const { dates } = await searchParams;
  if (process.env.DEMO_ROUTES !== "1") notFound();

  return (
    <main className={styles.page}>
      <div className={styles.intro}>
        <Text variant="heading" as="h2">
          Kiedy możesz?
        </Text>
        <Text variant="meta" as="p">
          Kliknij godziny, kiedy możesz. Możesz też przeciągnąć.
        </Text>
      </div>
      <GridDemo dates={week.slice(0, dates === "7" ? 7 : 3)} hours={hours} />
    </main>
  );
}
