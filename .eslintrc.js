module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:node/recommended",
    "prettier",
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    "node/no-missing-import": "off",
    "node/no-unsupported-features/es-syntax": "off",
    "node/no-unsupported-features/node-builtins": ["error", { version: ">=14.0.0" }],
    "node/no-unsupported-features/es-builtins": ["error", { version: ">=14.0.0" }],
    "node/no-deprecated-api": "warn",
    "node/no-extraneous-require": "off",
    "no-unused-vars": "warn",
    "no-console": "off",
    "no-async-promise-executor": "warn",
  },
};
