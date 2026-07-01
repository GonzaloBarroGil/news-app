import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  rootDir: ".",
  testMatch: [
    "<rootDir>/__tests__/**/*.test.tsx",
    "<rootDir>/__tests__/**/*.test.ts",
  ],
  setupFilesAfterEnv: ["<rootDir>/__tests__/jest.setup.ts"],
  moduleNameMapper: {
    "^@news-app/shared$": "<rootDir>/../shared/src/index.ts",
    "\\.module\\.css$": "identity-obj-proxy",
    "\\.css$": "identity-obj-proxy",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json",
        jsx: "react-jsx",
      },
    ],
  },
  collectCoverageFrom: ["<rootDir>/src/**/*.{ts,tsx}"],
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "lcov"],
  clearMocks: true,
  resetMocks: true,
};

export default config;
