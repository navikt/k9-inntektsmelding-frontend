import eslint from "@eslint/js";
import pluginQuery from "@tanstack/eslint-plugin-query";
import lodashPlugin from "eslint-plugin-lodash";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

const IGNORED_UNICORN_RULES = {
  "unicorn/filename-case": "off",
  "unicorn/no-null": "off",
  "unicorn/prevent-abbreviations": "off",
  "unicorn/no-nested-ternary": "off",
  "unicorn/prefer-top-level-await": "off",
};

export default tseslint.config(
  {
    ignores: [
      "src/vite-env.d.ts",
      "src/routeTree.gen.ts",
      "dist/*",
      "playwright-report/*",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      lodash: lodashPlugin,
    },
    rules: {
      "lodash/import-scope": ["error", "method"],
    },
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  ...pluginQuery.configs["flat/recommended"],
  eslintPluginUnicorn.configs["flat/recommended"],
  {
    rules: {
      eqeqeq: ["error", "always"],
      "no-console": "error",
      ...IGNORED_UNICORN_RULES,
    },
  },
  eslintPluginPrettierRecommended,
);
