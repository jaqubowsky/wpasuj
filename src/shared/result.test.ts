import { z } from "zod";
import * as zm from "zod/mini";
import { expect, it } from "vitest";
import { fail, ok, parse } from "./result";

it("says ok with nothing more", () => {
  expect(ok()).toEqual({ ok: true });
});

it("says ok beside the value it carries", () => {
  expect(ok({ id: "abcdefghij" })).toEqual({ ok: true, id: "abcdefghij" });
});

it("fails with a reason", () => {
  expect(fail("gone")).toEqual({ ok: false, reason: "gone" });
});

it("parses input into the schema's output", () => {
  expect(parse(z.string().trim(), "  Ola ")).toEqual({ ok: true, data: "Ola" });
});

it("parses with a zod mini schema too", () => {
  expect(parse(zm.int(), 7)).toEqual({ ok: true, data: 7 });
});

it("fails as invalid on input the schema refuses", () => {
  expect(parse(z.string().min(1), "")).toEqual({ ok: false, reason: "invalid" });
});
