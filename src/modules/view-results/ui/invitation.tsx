"use client";

import { Text } from "@/shared/ui/text/text";
import { AllVotes } from "./all-votes";
import { OrganiserCard } from "./organiser-card";
import { useResultsContext } from "./results-provider";
import { SetTime } from "./set-time";
import { WhoComes } from "./who-comes";

export function Invitation({ title }: { title: string }) {
  const { results, refreshFailed } = useResultsContext();
  const { final } = results;

  if (!final) return null;

  return (
    <>
      <div className="lg:col-start-1 lg:row-start-2">
        <SetTime final={final} title={title} />
      </div>
      <div className="contents lg:col-start-2 lg:row-start-2 lg:flex lg:flex-col lg:gap-4">
        <OrganiserCard />
        <WhoComes final={final} />
      </div>
      <div className="grid gap-3 lg:col-span-2">
        <AllVotes />
        {refreshFailed && (
          <Text as="p" variant="meta">
            Nie udało się odświeżyć. Spróbujemy za chwilę.
          </Text>
        )}
      </div>
    </>
  );
}
