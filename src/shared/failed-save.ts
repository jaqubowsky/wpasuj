export const savingActions = ["saveAnswer", "createPoll", "setFinal", "clearFinal", "deletePoll"] as const;
export const reportedErrorNames = ["TypeError", "Error", "AbortError", "SyntaxError", "other"] as const;

type SavingAction = (typeof savingActions)[number];
type ReportedErrorName = (typeof reportedErrorNames)[number];

const reportsPerPageLoad = 5;
let reportsSent = 0;

const isReportedName = (name: string): name is ReportedErrorName => reportedErrorNames.includes(name as ReportedErrorName);

export const reportFailedSave =
  (action: SavingAction) =>
  (error: unknown): undefined => {
    if (reportsSent >= reportsPerPageLoad) return;

    reportsSent++;
    const errorName = error instanceof Error && isReportedName(error.name) ? error.name : "other";

    navigator.sendBeacon("/api/failed-saves", JSON.stringify({ action, errorName }));
  };
