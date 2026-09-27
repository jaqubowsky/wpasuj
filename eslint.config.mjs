import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
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
