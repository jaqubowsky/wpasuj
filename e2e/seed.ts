import Database from "better-sqlite3";
import { randomBytes } from "node:crypto";
import { databasePath } from "../playwright.config";

type Poll = { dates: string[]; firstHour: number; lastHour: number };

function write<Result>(change: (database: Database.Database) => Result) {
  const database = new Database(databasePath);
  try {
    return change(database);
  } finally {
    database.close();
  }
}

export function seedPoll({ dates, firstHour, lastHour }: Poll) {
  const id = randomBytes(8).toString("base64url").slice(0, 10);
  write((database) =>
    database
      .prepare(
        `insert into polls (id, title, organiser_name, dates, first_hour, last_hour, time_zone, organiser_token_hash, created_by_participant, created_at)
         values (?, 'Planszówki u Michała', 'Kuba', ?, ?, ?, 'Europe/Warsaw', ?, 0, ?)`,
      )
      .run(id, JSON.stringify(dates), firstHour, lastHour, randomBytes(32).toString("hex"), Date.now()),
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
