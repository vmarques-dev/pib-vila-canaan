import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "coverage/**",
    "playwright-report/**",
    ".tmp-backup-*/**",
    "tmpclaude-*",
  ]),

  // Custom rules for PIB Vila Canaan project
  {
    rules: {
      // Proibir console.log em produção (usar logger)
      "no-console": ["warn", { allow: ["error", "warn"] }],

      // React Hooks
      "react-hooks/exhaustive-deps": "warn",

      // TypeScript
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",

      // Best practices
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],

      // React
      "react/jsx-no-target-blank": "error",
      "react/no-danger": "warn",

      // Next.js specific
      "@next/next/no-html-link-for-pages": "error",
    },
  },
]);

export default eslintConfig;
