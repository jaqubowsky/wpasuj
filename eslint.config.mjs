import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import { plugin as shadcn } from "@shadcn/lint";
import stylistic from "@stylistic/eslint-plugin";
import { readdirSync } from "node:fs";

const modules = readdirSync("src/modules", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const moduleBlocks = (name) => {
  const otherModules = {
    group: modules.filter((other) => other !== name).flatMap((other) => [`**/${other}`, `**/${other}/**`]),
    message: "A module never imports another module",
  };

  const app = { group: ["@/app", "@/app/**", "../**/app", "../**/app/**"], message: "A module never imports the app" };
  const ownUi = { group: ["../ui/**", `@/modules/${name}/ui/**`] };

  const restrict = (options) => ({ "@typescript-eslint/no-restricted-imports": ["error", options] });

  return [
    { files: [`src/modules/${name}/**`], rules: restrict({ patterns: [otherModules, app] }) },
    {
      files: [`src/modules/${name}/domain/**`],
      rules: restrict({
        paths: ["react", "react-dom", "better-sqlite3"],
        patterns: [
          otherModules,
          app,
          { group: ["next/*", "node:*"] },
          { group: ["../server/**", `@/modules/${name}/server/**`], allowTypeImports: true },
          ownUi,
        ],
      }),
    },
    { files: [`src/modules/${name}/server/**`], rules: restrict({ patterns: [otherModules, app, ownUi] }) },
  ];
};

const classNameJoins = [
  { selector: "JSXAttribute[name.name='className'] TemplateLiteral", message: "Combine classes with cn() from @/shared/ui/cn" },
  {
    selector: "JSXAttribute[name.name='className'] BinaryExpression[operator='+']",
    message: "Combine classes with cn() from @/shared/ui/cn",
  },
  {
    selector: "JSXAttribute[name.name='className'] CallExpression[callee.property.name='join']",
    message: "Combine classes with cn() from @/shared/ui/cn",
  },
];

const domainClock = "A domain function takes the clock as an argument; read the time in server/ or ui/ and pass it in";

const inlineSvg = { selector: "JSXOpeningElement[name.name='svg']", message: "Draw an icon with Icon from @/shared/ui/icon/icon" };

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { "@stylistic": stylistic },
    rules: {
      "@stylistic/padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: ["const", "let"], next: "*" },
        { blankLine: "any", prev: ["const", "let"], next: ["const", "let"] },
        { blankLine: "always", prev: "if", next: "*" },
        { blankLine: "any", prev: "if", next: "if" },
        { blankLine: "always", prev: "*", next: ["multiline-block-like", "multiline-expression", "multiline-const", "multiline-let"] },
        { blankLine: "always", prev: ["multiline-block-like", "multiline-expression", "multiline-const", "multiline-let"], next: "*" },
        { blankLine: "always", prev: "*", next: "return" },
      ],
      "no-eval": "error",
      "no-new-func": "error",
    },
  },
  { files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"], rules: { "react/no-danger": ["error", { customComponentNames: ["*"] }] } },
  { files: ["src/**"], ignores: ["src/shared/log-line.ts"], rules: { "no-console": "error" } },
  { files: ["src/modules/landing/ui/web-application-json-ld.tsx"], rules: { "react/no-danger": "off" } },
  {
    files: ["src/**/*.tsx"],
    plugins: { "better-tailwindcss": betterTailwindcss, shadcn },
    settings: {
      "better-tailwindcss": { entryPoint: "src/app/globals.css" },
      shadcn: { componentImports: ["^@/shared/ui/"] },
    },
    rules: {
      "better-tailwindcss/no-unknown-classes": "error",
      "better-tailwindcss/no-restricted-classes": [
        "error",
        {
          restrict: [
            { pattern: "^(?!.*motion-safe:)(.*:)?-?scale-", message: "Put a scale behind motion-safe: so reduced motion keeps it still" },
            {
              pattern:
                "^(.*:)?(shadow|inset-shadow|drop-shadow|\\[(box-shadow|text-shadow|filter):)\\S*(#|rgba?\\(|hsla?\\(|hwb\\(|lab\\(|lch\\(|oklab\\(|oklch\\(|color-mix\\(|color\\()",
              message: "Colours come from tokens.css: use var(--color-<name>) inside a shadow",
            },
          ],
        },
      ],
      "shadcn/no-arbitrary-values": [
        "error",
        {
          allow: [
            "shape",
            "effects",
            "motion",
            "grid-cols",
            "grid-rows-[auto]",
            "max-h-[60dvh]",
            "[scrollbar-width:none]",
            "content",
            "[--hour-column:--spacing(12)]",
            "scroll-pl-[calc(var(--hour-column)+--spacing(1.5))]",
            "shadow-[--spacing(1.5)_0_0_var(--color-paper)]",
            "pb-[calc(--spacing(*)+env(safe-area-inset-bottom))]",
          ],
        },
      ],
      "shadcn/no-raw-colors": "error",
      "shadcn/no-inline-styles": "error",
      "shadcn/no-restyle": "error",
      "shadcn/require-static-classes": "error",
      "no-restricted-syntax": ["error", ...classNameJoins, inlineSvg],
    },
  },
  {
    files: ["src/shared/ui/icon/icon.tsx", "src/shared/ui/wave-edge/wave-edge.tsx", "src/modules/landing/ui/try-poll/try-poll.tsx"],
    rules: { "no-restricted-syntax": ["error", ...classNameJoins] },
  },
  {
    files: [
      "src/modules/view-results/server/link-preview-image.tsx",
      "src/modules/landing/server/landing-card-image.tsx",
      "src/app/apple-icon.tsx",
    ],
    rules: { "shadcn/no-inline-styles": "off" },
  },
  {
    files: ["src/app/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/modules/*/**", "!**/modules/*/index", "!**/modules/*/client"],
              message: "Import a module through its index.ts or client.ts",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/shared/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/modules", "@/modules/**", "@/app/**", "../**/modules/**", "../**/app/**"],
              message: "shared sits below modules and app",
            },
          ],
        },
      ],
    },
  },
  ...modules.flatMap(moduleBlocks),
  {
    files: ["src/modules/*/domain/**"],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        { selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']", message: domainClock },
        { selector: "NewExpression[callee.name='Date'][arguments.length=0]", message: domainClock },
      ],
    },
  },
  {
    files: ["src/**"],
    ignores: ["src/**/*-store.ts", "src/**/*.test.{ts,tsx}", "src/shared/db/**", "src/shared/testing/**", "src/app/api/health/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["drizzle-orm", "drizzle-orm/*", "**/shared/db/client"],
              message: "Only a module's *-store.ts talks to the database",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".claude/**", "spec/**", "test-results/**", "playwright-report/**"]),
]);

export default eslintConfig;
