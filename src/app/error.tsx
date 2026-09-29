"use client";

import { ErrorPage } from "./error-page";
import { useRenderErrorReport } from "./use-render-error-report";

export default function RouteError({ error, retry }: { error: unknown; retry: () => void }) {
  useRenderErrorReport(error);

  return <ErrorPage retry={retry} />;
}
