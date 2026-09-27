import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

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
        { restrict: [{ pattern: "^(?!.*motion-safe:)(.*:)?-?scale-", message: "Put a scale behind motion-safe: so reduced motion keeps it still" }] },
      ],
    },
  },
  {
    files: ["src/modules/*/domain/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: ["react", "react-dom"],
          patterns: [
            { group: ["next/*"] },
            { group: ["../server/**"], allowTypeImports: true },
            { group: ["../ui/**"] },
          ],
        },
      ],
    },
  },
  {
    files: ["src/modules/*/server/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": ["error", { patterns: [{ group: ["../ui/**"] }] }],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".claude/**", "spec/**", "test-results/**", "playwright-report/**"]),
]);

export default eslintConfig;
