import { defineConfig } from '@playwright/test';
import shared from './playwright.config';

export default defineConfig({
  ...shared,
  webServer: {
    command: 'bun run build && bun run preview --port=5173',
    port: 5173,
    timeout: 120_000,
    reuseExistingServer: false,
  },
});

