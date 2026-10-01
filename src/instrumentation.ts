import { writeLogLine } from "@/shared/log-line";
import { maskedPath } from "@/shared/masked-path";
import type { Instrumentation } from "next";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { migrateDatabase } = await import("@/shared/db/migrate");
    const { scheduleExpiredPollCleanup } = await import("@/modules/create-poll");

    migrateDatabase();
    scheduleExpiredPollCleanup();
  }
}

export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  writeLogLine({
    level: "error",
    message: error instanceof Error ? error.message : String(error),
    path: maskedPath(request.path),
    digest: typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : undefined,
    routeType: context.routeType,
  });
};
