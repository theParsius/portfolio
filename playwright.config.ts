import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}/portfolio/`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop-1280x800',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'laptop-1366x640',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 640 } },
    },
    {
      name: 'phone-390x844',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    // Opt-in (WEBKIT=1 npm run e2e): desktop Safari engine, for focus and keyboard checks.
    ...(process.env.WEBKIT
      ? [
          {
            name: 'safari-1280x800',
            use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 800 } },
          },
        ]
      : []),
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/portfolio/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
