import { Avatar } from "@/shared/ui/avatar/avatar";
import { Text } from "@/shared/ui/text/text";
import styles from "./respondent-list.module.css";
import type { Results } from "./results-schema";
import { savedAgo } from "./saved-ago";

export function RespondentList({ results, previous }: { results: Results; previous?: Results }) {
  const seen = previous && new Set(previous.respondents.map((respondent) => respondent.name));
  const newestFirst = results.respondents.toSorted((a, b) => b.savedAt - a.savedAt);

  return (
    <section>
      <Text as="h2" variant="heading">
        Kto odpowiedział
      </Text>
      <ul className={styles.list} aria-label="Kto odpowiedział">
        {newestFirst.map((respondent) => (
          <li key={respondent.name}>
            <Avatar name={respondent.name} pop={seen && !seen.has(respondent.name)} />
            {respondent.name}
            <span className={styles.when}>
              {respondent.slots.length === 0 ? "nie może" : savedAgo(respondent.savedAt, results.readAt)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
