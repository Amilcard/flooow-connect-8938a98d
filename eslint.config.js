import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "scripts/**",           // Scripts d'audit non critiques
      "supabase/functions/**", // Edge functions Supabase
      "*.config.js",
      "*.config.ts",
    ]
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // React Hooks - critique pour éviter les bugs
      ...reactHooks.configs.recommended.rules,

      // React Refresh - warning seulement
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // Variables non utilisées - warning avec exceptions
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",        // Ignorer _param
        varsIgnorePattern: "^_",        // Ignorer _var
        caughtErrorsIgnorePattern: "^_", // Ignorer _error dans catch
      }],

      // Types any - warning (pas error pour ne pas bloquer)
      "@typescript-eslint/no-explicit-any": "warn",

      // Bonnes pratiques - warnings
      "prefer-const": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Désactivé pour éviter les faux positifs
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
);
