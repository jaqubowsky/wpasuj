"use client";

import { useSaveState } from "@/modules/answer-poll/client";
import { useRefreshResults } from "@/modules/view-results/client";
import { useEffect, useRef } from "react";

export function RefreshAfterSave() {
  const saveState = useSaveState();
  const refresh = useRefreshResults();
  const previous = useRef(saveState);

  useEffect(() => {
    if (saveState === "saved" && previous.current !== "saved") void refresh();

    previous.current = saveState;
  }, [saveState, refresh]);

  return null;
}
