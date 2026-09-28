import Database from "better-sqlite3";
import { createHash, randomBytes } from "node:crypto";
import { databasePath } from "../playwright.config";

type Poll = { dates: string[]; firstHour: number; hourCount: number; title?: string; organiserToken?: string };

function write<Result>(change: (database: Database.Database) => Result) {
  const database = new Database(databasePath);
  try {
    return change(database);
  } finally {
    database.close();
  }
}

export function seedPoll({
  dates,
  firstHour,
  hourCount,
  title = "Planszówki u Michała",
  organiserToken = randomBytes(32).toString("base64url"),
}: Poll) {
  const id = randomBytes(8).toString("base64url").slice(0, 10);
  write((database) =>
    database
      .prepare(
        `insert into polls (id, title, organiser_name, dates, first_hour, hour_count, time_zone, organiser_token_hash, created_by_participant, created_at)
         values (?, ?, 'Kuba', ?, ?, ?, 'Europe/Warsaw', ?, 0, ?)`,
      )
      .run(id, title, JSON.stringify(dates), firstHour, hourCount, createHash("sha256").update(organiserToken).digest("hex"), Date.now()),
  );
  return id;
}

export function seedAnswer(pollId: string, name: string, savedAt: number, cells: [string, number][]) {
  write((database) => {
    const { lastInsertRowid } = database
      .prepare(
        `insert into participants (poll_id, name, normalised_name, token_hash, created_at, updated_at) values (?, ?, ?, ?, ?, ?)`,
      )
      .run(pollId, name, name.toLocaleLowerCase("pl"), randomBytes(32).toString("hex"), savedAt, savedAt);
    const slot = database.prepare("insert into slots (participant_id, date, hour) values (?, ?, ?)");
    for (const [date, hour] of cells) slot.run(lastInsertRowid, date, hour);
  });
}
