import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import { plugin as shadcn } from "@shadcn/lint";
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
              pattern: "^(.*:)?(shadow|inset-shadow|drop-shadow|\\[(box-shadow|text-shadow|filter):)\\S*(#|rgba?\\(|hsla?\\(|hwb\\(|lab\\(|lch\\(|oklab\\(|oklch\\(|color-mix\\(|color\\()",
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
            "grid-rows",
            "h-[800dvh]",
            "h-[min(740px,82dvh)]",
            "max-h-[60dvh]",
            "[content-visibility:auto]",
            "[contain-intrinsic-size:auto_640px]",
            "[scrollbar-width:none]",
            "content",
            "[--hour-column:--spacing(12)]",
            "scroll-pl-[calc(var(--hour-column)+--spacing(1.5))]",
            "shadow-[--spacing(1.5)_0_0_var(--color-paper)]",
            "pb-[calc(--spacing(*)+env(safe-area-inset-bottom))]",
            "translate-x-[calc(var(--finger-column)*(100%+--spacing(1.5)))]",
            "translate-y-[calc(var(--finger-row)*(100%+--spacing(1.5)))]",
            "[transform:scaleY(var(--rail-fill))]",
          ],
        },
      ],
      "shadcn/no-raw-colors": "error",
      "shadcn/no-inline-styles": "error",
      "shadcn/no-restyle": "error",
      "shadcn/require-static-classes": "error",
      "no-restricted-syntax": [
        "error",
        { selector: "JSXAttribute[name.name='className'] TemplateLiteral", message: "Combine classes with cn() from @/shared/ui/cn" },
        { selector: "JSXAttribute[name.name='className'] BinaryExpression[operator='+']", message: "Combine classes with cn() from @/shared/ui/cn" },
        { selector: "JSXAttribute[name.name='className'] CallExpression[callee.property.name='join']", message: "Combine classes with cn() from @/shared/ui/cn" },
      ],
    },
  },
  {
    files: ["src/modules/view-results/server/link-preview-image.tsx", "src/modules/landing/server/landing-card-image.tsx", "src/app/apple-icon.tsx"],
    rules: { "shadcn/no-inline-styles": "off" },
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
