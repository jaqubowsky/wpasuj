import { writeLogLine } from "@/shared/log-line";
import { z } from "zod";
import { renderedRoutes, renderErrorNames } from "../../render-error";

const renderErrorSchema = z.strictObject({ errorName: z.enum(renderErrorNames), hasDigest: z.boolean(), route: z.enum(renderedRoutes) });

export async function POST(request: Request) {
  const report = renderErrorSchema.safeParse(await request.json().catch(() => undefined));

  if (!report.success) return new Response(null, { status: 400 });

  writeLogLine({ level: "error", message: "client_render_failed", ...report.data });

  return new Response(null, { status: 204 });
}
