module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	setupFiles: [
		"./setupTests.js"
	],
	transformIgnorePatterns: [],
	transform: {
		"\\.[jt]sx?$": [
			"ts-jest",
			{
				isolatedModules: true
			}
		]
	},
}
