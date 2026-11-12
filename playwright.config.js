import { defineConfig } from '@playwright/test';
// En Windows local el Chromium de Playwright puede estar bloqueado: se usa Edge. En CI, Chromium.
const CANAL = process.env.CI ? undefined : (process.env.COATL_CANAL || 'msedge');
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  workers: 2,
  use: { launchOptions: { args: ['--disable-gpu'] }, baseURL: 'http://127.0.0.1:8123', locale: 'es-MX' },
  webServer: { command: 'node scripts/servir.mjs 8123 dist', url: 'http://127.0.0.1:8123', reuseExistingServer: true },
  projects: [
    { name: 'escritorio', use: { browserName: 'chromium', channel: CANAL, viewport: { width: 1366, height: 900 } } },
    { name: 'movil', use: { browserName: 'chromium', channel: CANAL, viewport: { width: 390, height: 844 }, isMobile: true } },
  ],
});
