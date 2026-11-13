// Páginas por apartado, describir la situación, giros SCIAN, costos propios y modo oscuro.
import { test, expect } from '@playwright/test';

const visibles = (page) => page.evaluate(() => [...document.querySelectorAll('[data-pagina]')].filter((s) => !s.hidden).map((s) => s.id));

test('cada apartado se abre como página propia y respeta atrás/adelante', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(await visibles(page)).toEqual(['inicio', 'explorar']);
  await page.click('.nav-links a[data-vista="simulador"]');
  await expect(page.locator('#simulador')).toBeVisible();
  expect(await visibles(page)).toEqual(['simulador']);
  await expect(page).toHaveTitle(/^Simulador · /);
  await expect(page.locator('.nav-links a[aria-current="page"]')).toHaveText('Simulador');
  await page.click('.nav-links a[data-vista="metodologia"]');
  await expect(page.locator('#metodologia')).toBeVisible();
  expect(await visibles(page)).toEqual(['metodologia', 'trazabilidad', 'lectura']);
  await page.goBack();
  await expect(page.locator('#simulador')).toBeVisible();
});

test('un enlace profundo abre la página que contiene el destino', async ({ page }) => {
  await page.goto('/#mapa', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#mapa')).toBeVisible();
  expect(await visibles(page)).toEqual(['simulador']);
});

test('describir la situación ajusta el simulador (intérprete local)', async ({ page }) => {
  await page.goto('/#simulador', { waitUntil: 'domcontentloaded' });
  await page.fill('#descTexto', 'Quiero abrir una farmacia en Villa de las Flores con 90 clientes al día y un ticket de 150 pesos. La renta es de 12 mil y tendré 3 empleados.');
  await page.click('#descAplicar');
  await expect(page.locator('#wDescribir')).toHaveAttribute('data-estado', 'listo');
  await expect(page.locator('#giro')).toHaveValue('farmacia');
  await expect(page.locator('#zona')).toHaveValue('flores');
  await expect(page.locator('#clientes')).toHaveValue('90');
  await expect(page.locator('#ticket')).toHaveValue('150');
  await expect(page.locator('#renta')).toHaveValue('12000');
});

test('cualquier actividad del SCIAN se puede usar como giro, con su competencia real', async ({ page }) => {
  await page.goto('/#simulador', { waitUntil: 'domcontentloaded' });
  await page.focus('#giroBusca');
  await expect(page.locator('#giroTotal')).toContainText('actividades', { timeout: 15000 });
  await page.fill('#giroBusca', '465911 · ');
  await page.dispatchEvent('#giroBusca', 'change');
  await expect(page.locator('#giro')).toHaveValue('scian_465911');
  await expect(page.locator('#giroNota')).toContainText('estimación del equipo');
  await expect(page.locator('#compDenue')).toContainText('465911', { timeout: 15000 });
});

test('costos propios ilimitados entran al modelo', async ({ page }) => {
  await page.goto('/#simulador', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#probNum')).toHaveText('51.6%');
  await page.click('#t-finanzas');
  for (let i = 0; i < 3; i++) { await page.click('#extrasAgregar'); await page.locator('#extrasLista li').last().locator('input[type=number]').fill('20000'); }
  await expect(page.locator('#extrasTotal')).toHaveText('$60,000');
  await expect(page.locator('#probNum')).not.toHaveText('51.6%', { timeout: 5000 });
});

test('modo oscuro: solo icono, accesible y recordado', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const b = page.locator('#btnTema');
  await expect(b).toHaveAccessibleName('Activar modo oscuro');
  await expect(b).toHaveText('🌙');
  await b.click();
  await expect(page.locator('body')).toHaveClass(/oscuro/);
  await expect(b).toHaveText('☀️');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toHaveClass(/oscuro/);
});
