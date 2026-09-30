import { fail, ok, type Result } from "@/shared/result";
import { admitReport } from "../domain/report-window";

const reportTimes = new Map<string, number[]>();

export function takeReportSlot(address: string, now: Date): Result<object, "too-many"> {
  const { admitted, times } = admitReport(reportTimes.get(address) ?? [], now.getTime());

  reportTimes.set(address, times);

  return admitted ? ok() : fail("too-many");
}
