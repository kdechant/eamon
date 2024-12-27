const config = {
  "maxWorkers": 1,
  "moduleFileExtensions": [
    "js",
    "jsx",
    "ts",
    "tsx"
  ],
  "preset": "ts-jest",
  "setupFiles": ['./jest.setup.js'],
  "setupFilesAfterEnv": ["jest-expect-message"],
  "testEnvironment": "jsdom",
  "testMatch": [
    "**/__tests__/**/*.ts?(x)",
    "**/?(*.)+(spec|test).ts?(x)"
  ],
  "testPathIgnorePatterns": [
    "/node_modules/",
    "/adventures/base-adventure/"
  ],
  "transformIgnorePatterns": [
    "/node_modules/(?!(axios))"
  ],
  "testEnvironmentOptions": {
    "url": "http://localhost:8000/"
  }
}

export default config;
