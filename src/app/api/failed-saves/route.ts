import { reportedErrorNames, savingActions } from "@/shared/failed-save";
import { writeLogLine } from "@/shared/log-line";
import { z } from "zod";

const failedSaveSchema = z.strictObject({ action: z.enum(savingActions), errorName: z.enum(reportedErrorNames) });

export async function POST(request: Request) {
  const report = failedSaveSchema.safeParse(await request.json().catch(() => undefined));

  if (!report.success) return new Response(null, { status: 400 });

  writeLogLine({ level: "error", message: "client_save_failed", ...report.data });

  return new Response(null, { status: 204 });
}
