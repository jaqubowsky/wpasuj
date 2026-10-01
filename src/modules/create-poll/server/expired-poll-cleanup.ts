import { deleteExpiredPolls } from "./poll-store";

const day = 24 * 60 * 60 * 1000;

export function scheduleExpiredPollCleanup() {
  deleteExpiredPolls(new Date());
  setInterval(() => deleteExpiredPolls(new Date()), day).unref();
}
