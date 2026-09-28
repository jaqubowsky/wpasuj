"use client";

import type { ReactNode } from "react";
import { Button } from "@/shared/ui/button/button";

function goToForm(formId: string) {
  const form = document.getElementById(formId)!;

  form.scrollIntoView({ block: "start" });
  form.querySelector("input")!.focus({ preventScroll: true });
}

export function GoToFormButton({ formId, children }: { formId: string; children: ReactNode }) {
  return (
    <Button variant="primary" onClick={() => goToForm(formId)}>
      {children}
    </Button>
  );
}
