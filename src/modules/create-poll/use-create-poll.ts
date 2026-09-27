import { rememberName } from "@/shared/last-name";
import { shareOrCopy } from "@/shared/share-link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPoll } from "./create-poll-action";
import { createPollSchema, type CreatePollInput } from "./poll-schema";

const linkNoticeMs = { copied: 1500, "not-copied": 4000 };

type Field = "title" | "dates" | "organiserName";
type Status = "idle" | "creating" | "copied" | "not-copied" | "leaving" | "refused" | "failed";

const submittable = new Set<Status>(["idle", "refused", "failed"]);

export function useCreatePoll(input: Omit<CreatePollInput, "timeZone">) {
  const router = useRouter();
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const fullInput = { ...input, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };
  const parsed = createPollSchema.safeParse(fullInput);
  const invalidFields = new Set(attempted && !parsed.success ? parsed.error.issues.map((issue) => issue.path[0] as Field) : []);

  async function submit() {
    setAttempted(true);
    if (!parsed.success || !submittable.has(status)) return;
    setStatus("creating");

    const result = await createPoll(fullInput).catch(() => undefined);
    if (!result) {
      setStatus("failed");
      return;
    }
    if (!result.ok) {
      switch (result.reason) {
        case "invalid":
          setStatus("refused");
          return;
      }
    }

    rememberName(parsed.data.organiserName);
    const link = `${location.origin}/e/${result.id}`;
    const outcome = await shareOrCopy({ text: `Kiedy możecie? ${parsed.data.title} ${link}`, link });
    if (outcome === "copied" || outcome === "not-copied") {
      setStatus(outcome);
      await new Promise((resolve) => setTimeout(resolve, linkNoticeMs[outcome]));
    } else {
      setStatus("leaving");
    }
    router.push(`/e/${result.id}`);
  }

  return { submit, status, isInvalid: (field: Field) => invalidFields.has(field) };
}
