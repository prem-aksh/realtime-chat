import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {ignores: ["node_modules/**", "**/dist/**", "coverage/**", "**/.expo/**"]},
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", {argsIgnorePattern: "^_", varsIgnorePattern: "^_"}]
    }
  },
  {
    files: ["server/**/*.ts", "server/**/*.js"],
    languageOptions: {globals: {process: "readonly", require: "readonly", module: "readonly", Buffer: "readonly", console: "readonly", setTimeout: "readonly"}}
  },
  {
    files: ["mobile/**/*.ts", "mobile/**/*.tsx", "mobile/**/*.js"],
    languageOptions: {globals: {console: "readonly", process: "readonly", setTimeout: "readonly", module: "readonly", require: "readonly"}}
  }
);
