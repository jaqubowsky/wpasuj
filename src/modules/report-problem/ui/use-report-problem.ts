import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { reportProblem } from "../server/report-action";
import { reportSchema } from "../server/report-schema";

type Status = "closed" | "open" | "sending" | "too-many" | "failed" | "thanked";

const thanksShown = 5000;

export function useReportProblem() {
  const path = usePathname();
  const [status, setStatus] = useState<Status>("closed");
  const [attempted, setAttempted] = useState(false);
  const [text, setText] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState("");
  const input = { text, contact, website, path };
  const parsed = reportSchema.safeParse({ ...input, viewport: { width: 0, height: 0 } });
  const issues = attempted && !parsed.success ? parsed.error.issues : [];
  const textIssue = issues.find((issue) => issue.path[0] === "text");

  useEffect(() => {
    if (status !== "thanked") return;

    const timer = setTimeout(() => setStatus("closed"), thanksShown);

    return () => clearTimeout(timer);
  }, [status]);

  async function submit() {
    setAttempted(true);

    if (!parsed.success || status === "sending") return;

    setStatus("sending");

    const result = await reportProblem({ ...input, viewport: { width: window.innerWidth, height: window.innerHeight } }).catch(
      () => undefined,
    );

    if (!result) {
      setStatus("failed");

      return;
    }

    if (!result.ok) {
      switch (result.reason) {
        case "too-many":
          setStatus("too-many");

          return;
        case "invalid":
        case "unavailable":
          setStatus("failed");

          return;
        default:
          return result.reason satisfies never;
      }
    }

    setText("");
    setContact("");
    setAttempted(false);
    setStatus("thanked");
  }

  return {
    status,
    open: () => setStatus("open"),
    close: () => setStatus("closed"),
    submit,
    text,
    setText,
    contact,
    setContact,
    website,
    setWebsite,
    textError: textIssue && (textIssue.code === "too_big" ? "Najwyżej 2000 znaków, skróć trochę" : "Napisz, co nie działa"),
    contactError: issues.some((issue) => issue.path[0] === "contact") ? "Najwyżej 200 znaków" : undefined,
  };
}
