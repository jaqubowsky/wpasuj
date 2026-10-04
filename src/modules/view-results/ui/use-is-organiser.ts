import { trackAnalyticsEvent } from "@/shared/analytics";
import { reportFailedSave } from "@/shared/failed-save";
import type { Result } from "@/shared/result";
import { useState } from "react";
import type { FinalTime } from "../server/results-schema";

type Outcome = Result<object, "invalid" | "not-organiser" | "gone">;

export type Organiser = {
  title: string;
  token: string;
  setFinal: (final: FinalTime) => Promise<Outcome>;
  clearFinal: () => Promise<Outcome>;
  deletePoll: () => Promise<Outcome>;
};

export type OrganiserProblem = "invalid" | "not-organiser" | "failed";

export function useIsOrganiser(given: Organiser | undefined, refreshResults: () => void) {
  const [revoked, setRevoked] = useState(false);
  const [problem, setProblem] = useState<OrganiserProblem>();
  const [pending, setPending] = useState(false);

  async function settle(action: "setFinal" | "clearFinal" | "deletePoll", request: () => Promise<Outcome>, onDone: () => void) {
    setProblem(undefined);
    setPending(true);
    const outcome = await request().catch(reportFailedSave(action));

    setPending(false);
    if (!outcome) return setProblem("failed");

    if (outcome.ok) {
      if (action === "setFinal") trackAnalyticsEvent("time_set", "/e/[id]");

      return onDone();
    }

    switch (outcome.reason) {
      case "invalid":
        return setProblem("invalid");
      case "not-organiser":
        setRevoked(true);

        return setProblem("not-organiser");
      case "gone":
        return refreshResults();
      default:
        return outcome.reason satisfies never;
    }
  }

  const organiser = given &&
    !revoked && {
      title: given.title,
      token: given.token,
      pending,
      setFinal: (final: FinalTime) => settle("setFinal", () => given.setFinal(final), refreshResults),
      clearFinal: () => settle("clearFinal", given.clearFinal, refreshResults),
      deletePoll: () => settle("deletePoll", given.deletePoll, refreshResults),
    };

  return { organiser: organiser || undefined, organiserProblem: problem };
}
