"use server";

import { writeLogLine } from "@/shared/log-line";
import { maskedPath } from "@/shared/masked-path";
import { ok, parse, type Result } from "@/shared/result";
import { headers } from "next/headers";
import { issueDescription, issueTitle } from "../domain/report-issue";
import { fileTriageIssue } from "./linear-issue";
import { takeReportSlot } from "./report-limit";
import { reportSchema, type ReportInput } from "./report-schema";

type ReportResult = Result<object, "invalid" | "too-many" | "unavailable">;

export async function reportProblem(input: ReportInput): Promise<ReportResult> {
  const parsed = parse(reportSchema, input);

  if (!parsed.ok) return parsed;
  if (parsed.data.website) return ok();

  const requestHeaders = await headers();
  const now = new Date();
  const slot = takeReportSlot(requestHeaders.get("x-real-ip") ?? "", now);

  if (!slot.ok) return slot;

  const { text, contact, path, viewport } = parsed.data;

  const filed = await fileTriageIssue({
    title: issueTitle(text),
    description: issueDescription({
      text,
      contact,
      path: maskedPath(path),
      userAgent: requestHeaders.get("user-agent") ?? "",
      viewport,
      time: now,
    }),
  });

  if (!filed.ok) return filed;

  writeLogLine({ level: "info", message: "report_filed", issue: filed.identifier });

  return ok();
}
