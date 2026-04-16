import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/e2e",
    globalSetup: "./tests/e2e/global-setup.ts",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:8010",
        trace: "on-first-retry",
    },
    webServer: {
        command: "npm run e2e:server",
        url: "http://127.0.0.1:8010/login",
        reuseExistingServer: true,
        timeout: 120_000,
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
});
