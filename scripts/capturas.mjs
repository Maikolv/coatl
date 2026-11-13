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
  // Una captura completa (página entera, sin cortes) por apartado de la navegación.
  await p.setViewportSize({ width: 1366, height: 900 });
  const base = process.env.COATL_URL || 'http://127.0.0.1:8000/';
  for (const [hash, archivo] of [['inicio', 'inicio'], ['simulador', 'simulador'], ['contexto', 'territorio'], ['denue', 'denue'], ['empresas', 'empresas'], ['estrategia', 'estrategia'], ['metodologia', 'metodologia']]) {
    await p.goto(base + '#' + hash);
    await p.waitForTimeout(2500);
    const alto = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < alto; y += 600) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(250); }  // dispara gráficas y animaciones diferidas
    await p.evaluate(() => { document.querySelectorAll('.revela').forEach((e) => e.classList.add('visible')); document.querySelector('.nav').style.position = 'static'; scrollTo(0, 0); });
    await p.waitForTimeout(1200);
    await p.screenshot({ path: 'docs/capturas/' + archivo + '.png', fullPage: true });
  }
}
await nav.close();
console.log('Capturas listas');
