import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const polls = sqliteTable(
  "polls",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    organiserName: text("organiser_name").notNull(),
    dates: text("dates", { mode: "json" }).$type<string[]>().notNull(),
    lastDate: text("last_date").notNull(),
    firstHour: integer("first_hour").notNull(),
    hourCount: integer("hour_count").notNull(),
    timeZone: text("time_zone").notNull(),
    organiserTokenHash: text("organiser_token_hash").notNull(),
    finalDate: text("final_date"),
    finalFirstHour: integer("final_first_hour"),
    finalLastHour: integer("final_last_hour"),
    createdByParticipant: integer("created_by_participant", { mode: "boolean" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("polls_last_date").on(table.lastDate)],
);

export const participants = sqliteTable(
  "participants",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    pollId: text("poll_id")
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    normalisedName: text("normalised_name").notNull(),
    tokenHash: text("token_hash").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("participants_poll_name").on(table.pollId, table.normalisedName),
    uniqueIndex("participants_token_hash").on(table.tokenHash),
  ],
);

export const slots = sqliteTable(
  "slots",
  {
    participantId: integer("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    hour: integer("hour").notNull(),
  },
  (table) => [primaryKey({ columns: [table.participantId, table.date, table.hour] })],
);
