import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const eslint = new ESLint();

const restrictedImports = async (filePath: string, code: string) => {
  const [result] = await eslint.lintText(code, { filePath });

  return result.messages.filter((message) => message.ruleId === "@typescript-eslint/no-restricted-imports" && message.severity === 2)
    .length;
};

const domainFile = "src/modules/create-poll/domain/probe.ts";
const serverFile = "src/modules/create-poll/server/probe.ts";
const uiFile = "src/modules/view-results/ui/probe.ts";

describe("import direction lint", () => {
  it.each([
    ["domain imports its server as a value", domainFile, 'import { x } from "@/modules/create-poll/server/poll-queries";'],
    ["domain imports its ui", domainFile, 'import { x } from "@/modules/create-poll/ui/create-poll-form";'],
    ["domain imports node:fs", domainFile, 'import { x } from "node:fs";'],
    ["domain imports better-sqlite3", domainFile, 'import x from "better-sqlite3";'],
    ["server imports its ui", serverFile, 'import { x } from "@/modules/create-poll/ui/create-poll-form";'],
    ["a module imports the app", uiFile, 'import { x } from "@/app/app-header";'],
    ["a module imports the app relatively", uiFile, 'import { x } from "../../../app/app-header";'],
  ])("refuses %s", async (_, filePath, importLine) => {
    expect(await restrictedImports(filePath, `${importLine}\nexport const y = x;\n`)).toBe(1);
  });

  it("lets domain import its server's types", async () => {
    const code = 'import type { X } from "@/modules/create-poll/server/poll-queries";\nexport type Y = X;\n';

    expect(await restrictedImports(domainFile, code)).toBe(0);
  });
});
