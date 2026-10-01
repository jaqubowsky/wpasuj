import { writeLogLine } from "@/shared/log-line";
import Database from "better-sqlite3";
import { deleteExpiredPolls } from "./poll-store";

const day = 24 * 60 * 60 * 1000;

function cleanUp() {
  try {
    deleteExpiredPolls(new Date());
  } catch (error) {
    if (!(error instanceof Database.SqliteError)) throw error;

    writeLogLine({ level: "error", message: "cleanup_failed", code: error.code });
  }
}

export function scheduleExpiredPollCleanup() {
  cleanUp();
  setInterval(cleanUp, day).unref();
}
