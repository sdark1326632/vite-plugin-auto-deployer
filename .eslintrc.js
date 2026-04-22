module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:node/recommended",
    "prettier",
  ],
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    "node/no-missing-import": "off",
    "node/no-unsupported-features/es-syntax": "off",
    "node/no-unsupported-features/node-builtins": "off",
    "node/no-unsupported-features/es-builtins": "off",
    "node/no-deprecated-api": "warn",
    "node/no-extraneous-require": "off",
    "no-unused-vars": "warn",
    "no-console": "off",
    "no-async-promise-executor": "warn",
    "no-undef": "off",
  },
};
