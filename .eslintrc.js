module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2021,
  },
  rules: {
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-eval": "error",
    "no-var": "error",
    "prefer-const": "error",
    "no-console": "warn",
  },
  ignorePatterns: ["node_modules/", "coverage/"],
};
