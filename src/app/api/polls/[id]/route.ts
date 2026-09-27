import { findPoll } from "@/modules/create-poll";
import { readResults } from "@/modules/view-results";

export async function GET(_request: Request, { params }: RouteContext<"/api/polls/[id]">) {
  const { id } = await params;
  const now = new Date();
  const results = readResults(id, (pollId) => findPoll(pollId, now), now);
  if (!results) return Response.json({ reason: "gone" }, { status: 404 });
  return Response.json(results);
}
