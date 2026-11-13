// Pruebas de extremo a extremo de COATL (Playwright). Ejecutar: npm run test:e2e
import { test, expect } from '@playwright/test';

const erroresDe = (page) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  return errores;
};

test('carga sin errores de consola y muestra el escenario de referencia', async ({ page }) => {
  const errores = erroresDe(page);
  await page.goto('/?vista=todo', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#probNum')).toHaveText('51.6%', { timeout: 5000 });
  const kpis = page.locator('#kpis');
  await expect(kpis).toContainText('$60,371');
  await expect(kpis).toContainText('302.9%');
  await expect(kpis).toContainText('4.1 meses');
  await expect(kpis).toContainText('$912,776');
  await expect(page.locator('#ticket')).toHaveValue('95');
  await expect(page.locator('#cvar')).toHaveValue('38');
  expect(errores.filter((e) => !/tile|ERR_|Failed to load resource/i.test(e))).toEqual([]);
});

test('identidad visual: paleta y greca presentes', async ({ page }) => {
  await page.goto('/?vista=todo', { waitUntil: 'domcontentloaded' });
  const rojo = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--rojo').trim());
  expect(rojo.toUpperCase()).toBe('#C8102E');
  await expect(page.locator('.greca').first()).toBeAttached();
});

test('el simulador recalcula al cambiar una variable', async ({ page }) => {
  await page.goto('/?vista=todo', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#probNum')).toHaveText('51.6%');
  await page.locator('#experiencia').selectOption('0.38', { force: true });
  await expect(page.locator('#probNum')).not.toHaveText('51.6%', { timeout: 5000 });
});

test('mapa: 6 zonas en ranking y comparador', async ({ page }) => {
  await page.goto('/?vista=todo', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#ranking li')).toHaveCount(6);
  await expect(page.locator('#comparadorZonas tbody tr')).toHaveCount(6);
});

test('FODA: escenarios P5 / mediana / P95 ordenados', async ({ page }) => {
  await page.goto('/?vista=todo', { waitUntil: 'domcontentloaded' });
  const valores = page.locator('#triplete .universo .v');
  await expect(valores).toHaveCount(3);
  const v = await valores.allTextContents();
  const n = v.map((t) => Number(t.replace(/[^0-9-]/g, '')));
  expect(n[0]).toBeLessThan(n[1]);
  expect(n[1]).toBeLessThan(n[2]);
});

test('compartir por URL reproduce el escenario', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/?vista=todo', { waitUntil: 'domcontentloaded' });
  await page.locator('#giro').selectOption('farmacia', { force: true });
  await page.locator('#reserva').selectOption('0.35', { force: true });
  await expect(page.locator('#escVigente')).toHaveAttribute('data-estado', 'vigente');
  const p = await page.locator('#fodaP').textContent();
  await page.click('#compartirURL');
  const url = page.url();
  expect(url).toContain('#e=');
  const otra = await context.newPage();
  await otra.goto(url, { waitUntil: 'domcontentloaded' });
  await expect(otra.locator('#giro')).toHaveValue('farmacia');
  await expect(otra.locator('#probNum')).toHaveText(p, { timeout: 5000 });
});

test('comparar escenarios lado a lado', async ({ page }) => {
  await page.goto('/?vista=todo', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#evNombre')).toContainText('Cafetería');
  await page.click('#guardarEsc');
  await page.locator('#zona').selectOption('centro', { force: true });
  await expect(page.locator('#evNombre')).toContainText('Centro');
  await page.click('#guardarEsc');
  await expect(page.locator('#tablaComparar thead th')).toHaveCount(3);
});

test('exportar imagen descarga un PNG', async ({ page }) => {
  await page.goto('/?vista=todo', { waitUntil: 'domcontentloaded' });
  const [descarga] = await Promise.all([page.waitForEvent('download'), page.click('#exportarPNG')]);
  expect(descarga.suggestedFilename()).toBe('COATL-escenario.png');
});

test('sin desbordamiento horizontal', async ({ page }) => {
  await page.goto('/?vista=todo', { waitUntil: 'domcontentloaded' });
  const ancho = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(ancho).toBeLessThanOrEqual(1);
});

test('un enlace con valores fuera de rango no rompe el cálculo', async ({ page }) => {
  await page.goto('/?vista=todo#e=' + encodeURIComponent('crecimiento=-200&descuento=-100&clientes=abc'), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  const kpis = await page.locator('#kpis').innerText();
  expect(kpis).not.toMatch(/NaN|Infinity|∞/);
  await expect(page.locator('#crecimiento')).toHaveValue('-20');
  await expect(page.locator('#descuento')).toHaveValue('1');
});

test('pestañas navegables con flechas', async ({ page }) => {
  await page.goto('/?vista=todo', { waitUntil: 'domcontentloaded' });
  await page.locator('#t-negocio').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#t-ubicacion')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#t-ubicacion')).toBeFocused();
});
