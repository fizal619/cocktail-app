const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./test/acceptance",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:4000",
    video: "on",
    viewport: { width: 390, height: 844 },
  },
  webServer: {
    command: "bundle exec jekyll serve --port 4000",
    url: "http://localhost:4000",
    timeout: 30000,
    reuseExistingServer: true,
  },
  reporter: [["list"], ["html", { open: "never" }]],
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
