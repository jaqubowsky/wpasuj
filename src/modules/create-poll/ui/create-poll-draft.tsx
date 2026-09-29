"use client";

import { LinkCard } from "@/shared/ui/link-card/link-card";
import { createContext, use, useEffect, useState, type ReactNode } from "react";
import { draftPreview, type Draft } from "../domain/draft-preview";

const DraftContext = createContext<[Draft, (draft: Draft) => void] | null>(null);

export function CreatePollDraft({ children }: { children: ReactNode }) {
  const draft = useState<Draft>({ title: "", organiserName: "" });

  return <DraftContext value={draft}>{children}</DraftContext>;
}

export function useShareDraft(title: string, organiserName: string) {
  const setDraft = use(DraftContext)?.[1];

  useEffect(() => setDraft?.({ title, organiserName }), [setDraft, title, organiserName]);
}

export function DraftLinkPreview({ host }: { host: string }) {
  const [draft] = use(DraftContext)!;

  return <LinkCard {...draftPreview(draft)} tone="ink" host={host} />;
}
