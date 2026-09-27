import { findPoll } from "@/modules/create-poll";
import { calendarFile } from "@/modules/view-results";

export async function GET(_request: Request, { params }: RouteContext<"/e/[id]/termin.ics">) {
  const { id } = await params;
  const now = new Date();
  const poll = findPoll(id, now);
  if (!poll?.final) return new Response("Nie ma jeszcze ustalonego terminu.", { status: 404 });

  return new Response(calendarFile({ id, title: poll.title, timeZone: poll.timeZone, final: poll.final }, now), {
    headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": 'attachment; filename="termin.ics"' },
  });
}
