/* eslint-env node */
module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  ignorePatterns: ["dist", "lib", "example", "scripts", "__mocks__"],
};
