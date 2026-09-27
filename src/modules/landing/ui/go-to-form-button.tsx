"use client";

import { Button } from "@/shared/ui/button/button";

function goToForm(formId: string) {
  const form = document.getElementById(formId)!;
  form.scrollIntoView({ block: "start" });
  form.querySelector("input")!.focus({ preventScroll: true });
}

export function GoToFormButton({ formId }: { formId: string }) {
  return (
    <Button variant="primary" onClick={() => goToForm(formId)}>
      Utwórz ankietę
    </Button>
  );
}
