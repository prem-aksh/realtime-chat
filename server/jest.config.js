module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  moduleNameMapper: {"^@realtime-chat/shared$": "<rootDir>/../shared/src"}
};
