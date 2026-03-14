const { defineConfig, devices } = require('@playwright/test');

// Used exclusively by the feature-demo CI workflow.
// Runs only the Claude-generated demo script with slow motion so the
// video recording is easy to follow.
module.exports = defineConfig({
  testDir: './tests/e2e',
  testMatch: 'feature-demo.spec.js',
  reporter: [
    ['junit', { outputFile: 'test-results/demo-results.xml' }],
    ['html', { open: 'never', outputFolder: 'playwright-demo-report' }],
  ],
  use: {
    baseURL: 'http://localhost:4000',
    video: 'on',
    slowMo: 600,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'bundle exec jekyll serve',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
