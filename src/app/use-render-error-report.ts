import { useEffect } from "react";
import { reportRenderError } from "./render-error";

export function useRenderErrorReport(error: unknown) {
  useEffect(() => reportRenderError(error), [error]);
}
