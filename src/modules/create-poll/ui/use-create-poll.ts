import { deviceTimeZone } from "@/shared/dates/use-device-time-zone";
import { markFreshPoll } from "@/shared/fresh-poll";
import { rememberName } from "@/shared/last-name";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPoll } from "../server/create-poll-action";
import { createPollSchema, type CreatePollInput } from "../server/poll-schema";

type Field = "title" | "dates" | "organiserName";
type Status = "idle" | "creating" | "refused" | "failed";

export function useCreatePoll(input: Omit<CreatePollInput, "timeZone">) {
  const router = useRouter();
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const fullInput = { ...input, timeZone: deviceTimeZone() };
  const parsed = createPollSchema.safeParse(fullInput);
  const invalidFields = new Set(attempted && !parsed.success ? parsed.error.issues.map((issue) => issue.path[0] as Field) : []);

  async function submit() {
    setAttempted(true);
    if (!parsed.success || status === "creating") return;
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
    markFreshPoll(result.id);
    router.push(`/e/${result.id}`);
  }

  return { submit, status, isInvalid: (field: Field) => invalidFields.has(field) };
}
