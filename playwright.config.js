const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  reporter: [
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: 'http://localhost:4000',
    video: 'on',
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
