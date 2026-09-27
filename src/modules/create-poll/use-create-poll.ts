import { rememberName } from "@/shared/last-name";
import { shareOrCopy } from "@/shared/share-link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPoll } from "./create-poll-action";
import { createPollSchema, type CreatePollInput } from "./poll-schema";

const copiedNoticeMs = 1500;

type Field = "title" | "dates" | "organiserName";

export function useCreatePoll(input: Omit<CreatePollInput, "timeZone">) {
  const router = useRouter();
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<"idle" | "creating" | "copied" | "refused" | "offline">("idle");
  const fullInput = { ...input, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };
  const parsed = createPollSchema.safeParse(fullInput);
  const invalidFields = new Set(attempted && !parsed.success ? parsed.error.issues.map((issue) => issue.path[0] as Field) : []);

  async function submit() {
    setAttempted(true);
    if (!parsed.success || status === "creating") return;
    setStatus("creating");

    const result = await createPoll(fullInput).catch(() => undefined);
    if (!result) {
      setStatus("offline");
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
    if (outcome === "copied") {
      setStatus("copied");
      await new Promise((resolve) => setTimeout(resolve, copiedNoticeMs));
    }
    router.push(`/e/${result.id}`);
  }

  return { submit, status, isInvalid: (field: Field) => invalidFields.has(field) };
}
