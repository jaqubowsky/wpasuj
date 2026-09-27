import { LiveResults } from "./live-results";
import { readResults, type FindPollGrid } from "./results-queries";

export function ResultsPanel({ pollId, findPoll }: { pollId: string; findPoll: FindPollGrid }) {
  const results = readResults(pollId, findPoll, new Date());
  return results ? <LiveResults pollId={pollId} initial={results} /> : null;
}
