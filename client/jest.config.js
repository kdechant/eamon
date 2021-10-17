const config = {
  "moduleFileExtensions": [
    "js",
    "jsx",
    "ts",
    "tsx"
  ],
  "preset": "ts-jest",
  "setupFiles": ['./jest.setup.js'],
  "testEnvironment": "jsdom",
  "testMatch": [
    "**/__tests__/**/*.ts?(x)",
    "**/?(*.)+(spec|test).ts?(x)"
  ],
  "testPathIgnorePatterns": [
    "/node_modules/",
    "/adventures/base-adventure/"
  ],
  "testURL": "http://localhost:8000/"
}

module.exports = config;
