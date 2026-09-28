import { Avatar } from "@/shared/ui/avatar/avatar";
import { Text } from "@/shared/ui/text/text";
import type { Results } from "../server/results-schema";
import { savedAgo } from "../domain/saved-ago";

export function RespondentList({ results, previous }: { results: Results; previous?: Results }) {
  const seen = previous && new Set(previous.respondents.map((respondent) => respondent.name));
  const newestFirst = results.respondents.toSorted((a, b) => b.savedAt - a.savedAt);

  return (
    <section>
      <Text as="h2" variant="heading">
        Kto odpowiedział
      </Text>
      <ul className="m-0 mt-2 list-none p-0" aria-label="Kto odpowiedział">
        {newestFirst.map((respondent) => (
          <li key={respondent.name} className="flex h-12 items-center gap-3 border-t border-line first:border-t-0">
            <Avatar name={respondent.name} tintKey={respondent.normalisedName} pop={seen && !seen.has(respondent.name)} />
            {respondent.name}
            <span className="ml-auto text-sm text-muted">
              {respondent.slots.length === 0 ? "nie może" : savedAgo(respondent.savedAt, results.readAt)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
