/**
 * Cucumber.js configuration for BDD scenarios.
 * Runs feature files from packages/bff/features/ with step definitions.
 */
module.exports = {
  default: {
    require: [
      "features/step_definitions/**/*.steps.ts",
    ],
    paths: [
      "features/**/*.feature",
    ],
    format: [
      "progress-bar",
      "html:coverage/cucumber-report.html",
    ],
    formatOptions: {
      snippetInterface: "async-await",
    },
    publishQuiet: true,
    retry: 0,
  },
};
