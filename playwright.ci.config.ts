import { defineConfig } from '@playwright/test';
import shared from './playwright.config';

export default defineConfig({
	...shared,
	workers: 1,
	retries: 2,
	webServer: {
		command: 'bun run build && bun run preview --port=5173',
		port: 5173,
		timeout: 120_000,
		reuseExistingServer: false,
		stdout: 'pipe',
		stderr: 'pipe'
	}
});
