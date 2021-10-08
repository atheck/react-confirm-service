module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./tests/setupTests.ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
  ],
};