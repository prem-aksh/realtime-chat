module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/__tests__/**/*.test.ts?(x)"],
  moduleNameMapper: {"^@realtime-chat/shared$": "<rootDir>/../shared/src"}
};
