/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["./setupTests.js"],
  moduleNameMapper: {
    "\\.css$": "identity-obj-proxy",
  },
};
