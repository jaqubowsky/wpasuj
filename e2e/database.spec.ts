import { expect, test } from "@playwright/test";
import Database from "better-sqlite3";
import { databasePath } from "../playwright.config";

test("the app creates its tables in an empty database on start", async ({ request }) => {
  await request.get("/");

  const database = new Database(databasePath, { readonly: true });
  const tables = database
    .prepare("select name from sqlite_master where type = 'table' and name not like '\\_\\_%' escape '\\' and name not like 'sqlite%' order by name")
    .pluck()
    .all();
  database.close();

  expect(tables).toEqual(["participants", "polls", "slots"]);
});
