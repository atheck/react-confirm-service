/* eslint-disable strict */

// biome-ignore lint/style/noCommonJs: Config file
module.exports = {
	preset: "ts-jest",
	testEnvironment: "jsdom",
	collectCoverageFrom: ["src/**/*.{ts,tsx}"],
};
