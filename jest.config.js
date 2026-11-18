/* eslint-disable strict */

// biome-ignore lint/style/noCommonJs: Config file
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	collectCoverageFrom: ["src/**/*.{ts,tsx}"],
};
