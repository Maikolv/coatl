// DENUE nacional (datos reales sincronizados) y análisis confidencial de empresas.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const ir = (page) => page.goto('/?vista=todo', { waitUntil: 'domcontentloaded' });
const leer = (f) => JSON.parse(fs.readFileSync('dist/data/denue/' + f, 'utf8'));

test('DENUE: Coacalco coincide con los datos sincronizados', async ({ page }) => {
  const ent15 = leer('ent/15.json');
  await ir(page);
  await page.locator('#denue').scrollIntoViewIfNeeded();
  await expect(page.locator('#wDenue')).toHaveAttribute('data-estado', 'listo', { timeout: 20000 });
  await expect(page.locator('#denueEnt')).toHaveValue('15');
  await expect(page.locator('#denueMun')).toHaveValue('020');
  await expect(page.locator('#denueCifras')).toContainText(ent15['020'].total.toLocaleString('es-MX'));
  await expect(page.locator('#denueMeta')).toContainText('DENUE');
});

test('DENUE: todas las entidades, cambio de municipio y búsqueda por actividad', async ({ page }) => {
  const nac = leer('nacional.json');
  await ir(page);
  await page.locator('#denue').scrollIntoViewIfNeeded();
  await expect(page.locator('#wDenue')).toHaveAttribute('data-estado', 'listo', { timeout: 20000 });
  await expect(page.locator('#denueEnt option')).toHaveCount(Object.keys(nac.entidades).length);
  await page.selectOption('#denueEnt', '09');
  await expect(page.locator('#wDenue')).toHaveAttribute('data-estado', 'listo', { timeout: 20000 });
  await page.fill('#denueBusca', 'cafeter');
  await expect(page.locator('#denueClases')).toContainText('722515');
});

test('DENUE: competencia registrada junto al simulador', async ({ page }) => {
  await ir(page);
  await page.locator('#simulador').scrollIntoViewIfNeeded();
  await expect(page.locator('#compDenue')).toContainText('722515', { timeout: 20000 });
});

const CSV = ['mes,ventas,clientes,costo_variable,costos_fijos',
  ...[178, 182, 169, 190, 201, 195, 188, 176, 184, 199, 215, 240].map((v, i) =>
    `2025-${String(i + 1).padStart(2, '0')},${v * 1000},${Math.round(v * 1000 / 95)},${Math.round(v * 410)},27000`)].join('\n');

test('Empresas: analiza un CSV sin hacer ninguna petición de red', async ({ page }) => {
  await ir(page);
  await page.locator('#empresas').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  const peticiones = [];
  // Lo relevante: nada se envía. Se permiten lecturas (mosaicos del mapa, gráficas) que no llevan datos.
  page.on('request', (r) => { if (r.method() !== 'GET' || (r.postData() || '').length) peticiones.push(r.method() + ' ' + r.url()); });
  await page.setInputFiles('#empArchivo', { name: 'mi-negocio.csv', mimeType: 'text/csv', buffer: Buffer.from(CSV) });
  await expect(page.locator('#wEmpresa')).toHaveAttribute('data-estado', 'listo');
  await expect(page.locator('#empCifras')).toContainText('100%');
  await expect(page.locator('#empTabla')).toContainText('Ticket promedio');
  expect(peticiones).toEqual([]);
  await page.click('#empAplicar');
  await expect(page.locator('#ticket')).toHaveValue('95');
  await page.click('#empBorrar');
  await expect(page.locator('#empResultados')).toBeHidden();
});

test('Empresas: archivo inválido muestra un error claro', async ({ page }) => {
  await ir(page);
  await page.setInputFiles('#empArchivo', { name: 'malo.csv', mimeType: 'text/csv', buffer: Buffer.from('mes,ventas\n2025-01,10') });
  await expect(page.locator('#wEmpresa')).toHaveAttribute('data-estado', 'error');
  await expect(page.locator('#wEmpresa-estado')).toContainText('Faltan columnas');
});
