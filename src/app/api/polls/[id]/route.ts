import { findPoll } from "@/modules/create-poll";
import { readResults } from "@/modules/view-results";
import { cookies } from "next/headers";

export async function GET(_request: Request, { params }: RouteContext<"/api/polls/[id]">) {
  const { id } = await params;
  const now = new Date();
  const poll = findPoll(id, now);
  if (!poll) return Response.json({ reason: "gone" }, { status: 404 });
  return Response.json(readResults(id, poll, now, (await cookies()).get(id)?.value));
}
