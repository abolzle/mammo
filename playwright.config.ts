import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: { baseURL: "http://127.0.0.1:43149", trace: "on-first-retry" },
  webServer: {
    command: "npx next dev --port 43149 --hostname 127.0.0.1",
    url: "http://127.0.0.1:43149",
    reuseExistingServer: false,
    timeout: 120000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
