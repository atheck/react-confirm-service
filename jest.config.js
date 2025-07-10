/* eslint-disable strict */

// biome-ignore lint/style/noCommonJs: Config file
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	setupFilesAfterEnv: ["./tests/setupTests.ts"],
	collectCoverageFrom: ["src/**/*.{ts,tsx}"],
};
