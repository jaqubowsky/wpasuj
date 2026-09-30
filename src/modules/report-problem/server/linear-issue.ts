import { writeLogLine } from "@/shared/log-line";
import { fail, ok, type Result } from "@/shared/result";

const wpasujTeam = "5022a401-c39d-49f6-8ceb-c71be267c54e";
const triageState = "443dd690-c5ff-42f0-ae78-2b660148453c";
const userReportLabel = "c4d46511-9711-46bd-9520-2326efaa28a1";

const issueCreate = `mutation ReportProblem($input: IssueCreateInput!) {
  issueCreate(input: $input) { success issue { identifier } }
}`;

type IssueCreateAnswer = { data?: { issueCreate?: { success: boolean; issue: { identifier: string } | null } } | null };

function unavailable(cause: "no-key" | "network" | "linear", status?: number) {
  writeLogLine({ level: "error", message: "report_failed", cause, status });

  return fail("unavailable");
}

export async function fileTriageIssue(issue: {
  title: string;
  description: string;
}): Promise<Result<{ identifier: string }, "unavailable">> {
  const key = process.env.LINEAR_API_KEY;

  if (!key) return unavailable("no-key");

  const response = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: key },
    body: JSON.stringify({
      query: issueCreate,
      variables: { input: { teamId: wpasujTeam, stateId: triageState, labelIds: [userReportLabel], ...issue } },
    }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => undefined);

  if (!response) return unavailable("network");

  const answer: IssueCreateAnswer = await response.json().catch(() => ({}));
  const created = answer.data?.issueCreate;

  if (!response.ok || !created?.success || !created.issue) return unavailable("linear", response.status);

  return ok({ identifier: created.issue.identifier });
}
