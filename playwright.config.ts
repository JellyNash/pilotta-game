import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  webServer: {
    command: 'npm run dev -- --port 3000',
    port: 3000,
    reuseExistingServer: true,
    env: { CI: 'true' },
    timeout: 120 * 1000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
});
