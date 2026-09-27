import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import { readdirSync } from "node:fs";

const modules = readdirSync("src/modules", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const moduleBlocks = (name) => {
  const otherModules = {
    group: modules.filter((other) => other !== name).flatMap((other) => [`**/${other}`, `**/${other}/**`]),
    message: "A module never imports another module",
  };
  const restrict = (options) => ({ "@typescript-eslint/no-restricted-imports": ["error", options] });
  return [
    { files: [`src/modules/${name}/**`], rules: restrict({ patterns: [otherModules] }) },
    {
      files: [`src/modules/${name}/domain/**`],
      rules: restrict({
        paths: ["react", "react-dom"],
        patterns: [otherModules, { group: ["next/*"] }, { group: ["../server/**"], allowTypeImports: true }, { group: ["../ui/**"] }],
      }),
    },
    { files: [`src/modules/${name}/server/**`], rules: restrict({ patterns: [otherModules, { group: ["../ui/**"] }] }) },
  ];
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.tsx"],
    plugins: { "better-tailwindcss": betterTailwindcss },
    settings: { "better-tailwindcss": { entryPoint: "src/app/globals.css" } },
    rules: {
      "better-tailwindcss/no-unknown-classes": "error",
      "better-tailwindcss/no-restricted-classes": [
        "error",
        {
          restrict: [
            { pattern: "^(?!.*motion-safe:)(.*:)?-?scale-", message: "Put a scale behind motion-safe: so reduced motion keeps it still" },
            {
              pattern: "\\[[^\\]]*(#|rgba?\\(|hsla?\\(|hwb\\(|lab\\(|lch\\(|oklab\\(|oklch\\(|color-mix\\(|color\\(|color:)",
              message: "Colours come from tokens.css: use a colour token",
            },
            {
              pattern: "^(.*:)?(bg|text|border|border-[trblxyse]|outline|ring|ring-offset|fill|stroke|decoration|accent|caret|divide|placeholder|from|via|to|shadow|inset-shadow)-\\[[a-z]+\\]$",
              message: "Colours come from tokens.css: use a colour token",
            },
            { pattern: "^(.*:)?text-\\[(length:)?[\\d.]", message: "Type comes from tokens.css: use text-<role>" },
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        { patterns: [{ group: ["**/modules/*/**", "!**/modules/*/index", "!**/modules/*/client"], message: "Import a module through its index.ts or client.ts" }] },
      ],
    },
  },
  {
    files: ["src/shared/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        { patterns: [{ group: ["@/modules", "@/modules/**", "@/app/**", "../**/modules/**", "../**/app/**"], message: "shared sits below modules and app" }] },
      ],
    },
  },
  ...modules.flatMap(moduleBlocks),
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".claude/**", "spec/**", "test-results/**", "playwright-report/**"]),
]);

export default eslintConfig;
