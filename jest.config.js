module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "tests",
  setupFilesAfterEnv: ["./setupTests.ts"]
};