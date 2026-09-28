import { grantOrganiser, isPollId } from "@/modules/create-poll";

export async function GET(_request: Request, { params }: RouteContext<"/e/[id]/organizator/[token]">) {
  const { id, token } = await params;
  if (!isPollId(id)) return new Response(null, { status: 404 });
  await grantOrganiser(id, token);
  return new Response(null, { status: 303, headers: { location: `/e/${id}` } });
}
