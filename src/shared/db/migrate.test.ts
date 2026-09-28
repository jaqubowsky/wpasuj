import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import * as schema from "./schema";

const migrations = join(process.cwd(), "drizzle");
const directory = mkdtempSync(join(tmpdir(), "wpasuj-migrate-"));

afterEach(() => {
  rmSync(directory, { recursive: true, force: true });
});

function firstMigrationOnly() {
  const folder = join(directory, "first");

  cpSync(migrations, folder, { recursive: true });
  const journal = JSON.parse(readFileSync(join(folder, "meta/_journal.json"), "utf8"));

  journal.entries = journal.entries.slice(0, 1);
  writeFileSync(join(folder, "meta/_journal.json"), JSON.stringify(journal));

  return folder;
}

it("keeps a poll created before ranges could pass midnight", () => {
  const sqlite = new Database(join(directory, "old.db"));
  const db = drizzle(sqlite, { schema });

  migrate(db, { migrationsFolder: firstMigrationOnly() });

  sqlite
    .prepare(
      `insert into polls (id, title, organiser_name, dates, first_hour, last_hour, time_zone, organiser_token_hash, final_date, final_first_hour, final_last_hour, created_by_participant, created_at)
       values ('abcdefghij', 'Kino', 'Kuba', '["2030-10-18","2030-10-19"]', 17, 23, 'Europe/Warsaw', 'hash', '2030-10-19', 19, 22, 0, 1)`,
    )
    .run();

  sqlite
    .prepare(
      `insert into participants (poll_id, name, normalised_name, token_hash, created_at, updated_at) values ('abcdefghij', 'Ola', 'ola', 't', 1, 1)`,
    )
    .run();

  sqlite.prepare(`insert into slots (participant_id, date, hour) values (1, '2030-10-19', 19), (1, '2030-10-19', 22)`).run();

  migrate(db, { migrationsFolder: migrations });

  expect(db.select().from(schema.polls).all()).toEqual([
    expect.objectContaining({
      dates: ["2030-10-18", "2030-10-19"],
      firstHour: 17,
      hourCount: 6,
      finalDate: "2030-10-19",
      finalFirstHour: 19,
      finalLastHour: 22,
    }),
  ]);

  expect(db.select().from(schema.slots).all()).toEqual([
    { participantId: 1, date: "2030-10-19", hour: 19 },
    { participantId: 1, date: "2030-10-19", hour: 22 },
  ]);

  sqlite.close();
});
