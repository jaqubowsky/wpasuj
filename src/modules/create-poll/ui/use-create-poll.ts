import { deviceTimeZone } from "@/shared/dates/use-device-time-zone";
import { rememberPoll } from "@/shared/device-polls";
import { reportFailedSave } from "@/shared/failed-save";
import { markFreshPoll } from "@/shared/fresh-poll";
import { rememberName } from "@/shared/last-name";
import { useMotion } from "@/shared/ui/motion-toggle/use-motion";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { createPoll } from "../server/create-poll-action";
import { createPollSchema, type CreatePollInput } from "../server/poll-schema";

type Field = "title" | "dates" | "organiserName";
type Status = "idle" | "creating" | "refused" | "failed";

export function useCreatePoll(input: Omit<CreatePollInput, "timeZone">) {
  const router = useRouter();
  const { moving } = useMotion();
  const fields = useRef<Partial<Record<Field, HTMLElement | null>>>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const fullInput = { ...input, timeZone: deviceTimeZone() };
  const parsed = createPollSchema.safeParse(fullInput);
  const invalidFields = new Set(attempted && !parsed.success ? parsed.error.issues.map((issue) => issue.path[0] as Field) : []);

  async function submit() {
    flushSync(() => setAttempted(true));

    if (!parsed.success) {
      const field = fields.current[parsed.error.issues[0].path[0] as Field]!;

      field.scrollIntoView({ block: "center", behavior: moving ? "smooth" : "instant" });
      (field instanceof HTMLFieldSetElement ? field.querySelector("button")! : field).focus({ preventScroll: true });

      return;
    }

    if (status === "creating") return;

    setStatus("creating");

    const result = await createPoll(fullInput).catch(reportFailedSave("createPoll"));

    if (!result) {
      setStatus("failed");

      return;
    }

    if (!result.ok) {
      switch (result.reason) {
        case "invalid":
          setStatus("refused");

          return;
        default:
          return result.reason satisfies never;
      }
    }

    rememberName(parsed.data.organiserName);
    markFreshPoll(result.id);
    rememberPoll({ id: result.id, role: "organiser", lastDate: parsed.data.dates.at(-1)! });
    router.push(`/e/${result.id}`);
  }

  return {
    submit,
    status,
    isInvalid: (field: Field) => invalidFields.has(field),
    fieldRef: (field: Field) => (element: HTMLElement | null) => {
      fields.current[field] = element;
    },
  };
}
