import { devices, type PlaywrightTestConfig } from '@playwright/test';

const executablePath = process.env.PLAYWRIGHT_LAUNCH_OPTIONS_EXECUTABLE_PATH;

const shared: PlaywrightTestConfig = {
	testDir: 'e2e',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	workers: 1,
	webServer: {
		command: 'bun run dev -- --host 127.0.0.1',
		url: 'http://127.0.0.1:5173',
		reuseExistingServer: !process.env.CI
	},
	use: {
		baseURL: 'http://127.0.0.1:5173',
		...(executablePath ? { launchOptions: { executablePath } } : {})
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'Mobile Chrome',
			use: { ...devices['Pixel 5'] }
		}
	]
};

const config: PlaywrightTestConfig = {
	...shared
};

export default config;
