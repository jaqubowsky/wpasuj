import { safeParse, type $ZodType, type output } from "zod/v4/core";

type Success<Value extends object = object> = { ok: true } & Value;

export type Failure<Reason extends string, Detail extends object = object> = { ok: false; reason: Reason } & Detail;

export type Result<Value extends object, Reason extends string> = Success<Value> | Failure<Reason>;

export function ok<Value extends object = object>(value = {} as Value): Success<Value> {
  return { ok: true, ...value };
}

export function fail<Reason extends string>(reason: Reason): Failure<Reason> {
  return { ok: false, reason };
}

export function parse<Schema extends $ZodType>(schema: Schema, input: unknown): Result<{ data: output<Schema> }, "invalid"> {
  const parsed = safeParse(schema, input);

  return parsed.success ? ok({ data: parsed.data }) : fail("invalid");
}
