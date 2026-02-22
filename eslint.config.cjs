const js = require("@eslint/js");
const { FlatCompat } = require("@eslint/eslintrc");
const path = require("node:path");

// Use legacy-style config blocks so existing .eslintrc behavior is preserved on ESLint v10.
const makeCompat = (dir) =>
  new FlatCompat({
    baseDirectory: dir,
    resolvePluginsRelativeTo: dir,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
  });

const commandsCompat = makeCompat(path.join(__dirname, "packages/commands"));
const cliCompat = makeCompat(path.join(__dirname, "apps/cli"));
const desktopCompat = makeCompat(path.join(__dirname, "apps/desktop"));

module.exports = [
  // Keep lint focused on source files and skip generated/runtime artifacts.
  {
    ignores: [
      "**/dist/**",
      "**/.turbo/**",
      "**/.vite/**",
      "**/node_modules/**",
      "**/coverage/**",
    ],
  },
  ...commandsCompat
    .config({
      env: {
        es6: true,
        node: true,
      },
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
      ],
      parser: "@typescript-eslint/parser",
      settings: {
        "import/resolver": {
          typescript: {
            project: ["./tsconfig.json"],
          },
        },
      },
    })
    .map((config) => ({
      ...config,
      files: ["packages/commands/src/**/*.ts"],
    })),
  ...cliCompat
    .config({
      env: {
        es6: true,
        node: true,
      },
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
      ],
      parser: "@typescript-eslint/parser",
      settings: {
        "import/resolver": {
          typescript: {
            project: ["./tsconfig.json"],
          },
        },
      },
    })
    .map((config) => ({
      ...config,
      files: ["apps/cli/src/**/*.ts"],
    })),
  ...desktopCompat
    .config({
      env: {
        browser: true,
        es6: true,
        node: true,
      },
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/electron",
        "plugin:import/typescript",
      ],
      parser: "@typescript-eslint/parser",
      settings: {
        "import/resolver": {
          typescript: {
            project: ["./tsconfig.json"],
          },
        },
      },
    })
    .map((config) => ({
      ...config,
      files: ["apps/desktop/**/*.{ts,tsx}"],
    })),
];
