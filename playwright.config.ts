import { defineConfig } from '@playwright/test';

import { devices, type PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    testDir: 'e2e',
    testMatch: /(.+\.)?(test|spec)\.[jt]s/,
    use: {
        baseURL: 'http://localhost:5173'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] }
        },
    ]
};

export default config;

