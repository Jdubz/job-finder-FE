import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"
import { defineConfig, globalIgnores } from "eslint/config"
import prettierConfig from "eslint-config-prettier"

export default defineConfig([
  globalIgnores(["dist", "node_modules", "build", ".vite"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
      prettierConfig,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  // Disable react-refresh rule for UI components (shadcn/ui patterns) and router
  {
    files: [
      "src/components/ui/**/*.{ts,tsx}",
      "src/router.tsx",
      "src/contexts/**/*.tsx",
    ],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
])
