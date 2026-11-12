// Renderiza el diagrama UML a PNG y toma capturas del sitio para el README.
// Uso: node scripts/capturas.mjs   (requiere `npx playwright install chromium`)
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const nav = await chromium.launch({ channel: process.env.CI ? undefined : (process.env.COATL_CANAL || 'msedge'), args: ['--disable-gpu'] });
const p = await nav.newPage({ deviceScaleFactor: 1 });
await p.setViewportSize({ width: 1660, height: 1440 });
await p.setContent('<body style="margin:0">' + fs.readFileSync('docs/diagrama-proceso.svg', 'utf8').replace(/^<?xml[^>]*>/, '') + '</body>');
await p.screenshot({ path: 'entregables/diagrama-proceso.png', fullPage: true });
fs.copyFileSync('entregables/diagrama-proceso.png', 'docs/diagrama-proceso.png');
if (process.argv.includes('--sitio')) {
  fs.mkdirSync('docs/capturas', { recursive: true });
  await p.setViewportSize({ width: 1366, height: 900 });
  await p.goto(process.env.COATL_URL || 'http://127.0.0.1:8123/');
  await p.waitForTimeout(2500);
  await p.evaluate(() => document.querySelectorAll('.revela').forEach((e) => e.classList.add('visible')));
  await p.waitForTimeout(900);
  await p.screenshot({ path: 'docs/capturas/inicio.png' });
  for (const [id, archivo] of [['simulador', 'simulador'], ['analisis', 'analisis'], ['mapa', 'mapa'], ['estrategia', 'foda']]) {
    await p.locator('#' + id).scrollIntoViewIfNeeded();
    await p.waitForTimeout(1200);
    await p.locator('#' + id).screenshot({ path: `docs/capturas/${archivo}.png` });
  }
}
await nav.close();
console.log('Capturas listas');
