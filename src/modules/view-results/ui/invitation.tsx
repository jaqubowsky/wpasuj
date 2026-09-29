"use client";

import { Text } from "@/shared/ui/text/text";
import { AllVotes } from "./all-votes";
import { OrganiserCard } from "./organiser-card";
import { useResultsContext } from "./results-provider";
import { SetActions } from "./set-time";
import { WhoComes } from "./who-comes";

export function Invitation({ title, timeZone }: { title: string; timeZone: string }) {
  const { results, refreshFailed } = useResultsContext();
  const { final } = results;

  if (!final) return null;

  return (
    <>
      <div className="lg:col-start-1 lg:row-start-1">
        <WhoComes final={final} />
      </div>
      <div className="contents lg:col-start-2 lg:row-start-1 lg:flex lg:flex-col lg:gap-4">
        <SetActions final={final} title={title} timeZone={timeZone} />
        <OrganiserCard />
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
