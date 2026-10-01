"use client";

import type { ReactNode } from "react";
import { Button } from "@/shared/ui/button/button";

function goToForm(formId: string) {
  const form = document.getElementById(formId)!;

  form.scrollIntoView({ block: "start" });
  form.querySelector<HTMLElement>("textarea, input")!.focus({ preventScroll: true });
}

export function GoToFormButton({
  formId,
  variant = "primary",
  children,
  "data-report-pill-clear": reportPillClear,
}: {
  formId: string;
  variant?: "primary" | "loud" | "loud-light";
  children: ReactNode;
  "data-report-pill-clear"?: boolean;
}) {
  return (
    <Button variant={variant} onClick={() => goToForm(formId)} data-report-pill-clear={reportPillClear}>
      {children}
    </Button>
  );
}
