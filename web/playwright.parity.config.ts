import { defineConfig } from "@playwright/test";

const inCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./tests/parity",
  timeout: 180_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: inCI ? 1 : 0,
  reporter: [["line"]],
  use: {
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "python3 -m http.server 4100 --bind 127.0.0.1 --directory ../site",
      url: "http://127.0.0.1:4100/en/",
      reuseExistingServer: !inCI,
      timeout: 120_000,
    },
    {
      command: "npm run start -- --hostname 127.0.0.1 --port 4200",
      url: "http://127.0.0.1:4200/en/",
      reuseExistingServer: !inCI,
      timeout: 120_000,
    },
  ],
});
