import type { Instrumentation } from "next";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { migrateDatabase } = await import("@/shared/db/migrate");
    migrateDatabase();
  }
}

export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  console.error(
    JSON.stringify({
      level: "error",
      message: error instanceof Error ? error.message : String(error),
      path: request.path.split("?")[0].replace(/^(\/e\/[^/]+\/organizator\/)[^/]+/, "$1[token]"),
      digest: typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : undefined,
      routeType: context.routeType,
    }),
  );
};
