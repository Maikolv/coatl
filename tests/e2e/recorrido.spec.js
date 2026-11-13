// Recorrido exploratorio: ajustar supuesto → ejecutar → interpretar → verificar fuente.
import { test, expect } from '@playwright/test';

const ir = (page) => page.goto('/', { waitUntil: 'domcontentloaded' });
const WIDGETS = ['wDemo', 'wMapa', 'wSup', 'wMC', 'wSuperficie', 'wTraza'];

test('los seis widgets terminan en estado «listo» y sin errores', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(String(e)));
  await ir(page);
  for (const id of WIDGETS) await expect(page.locator('#' + id)).toHaveAttribute('data-estado', 'listo', { timeout: 15000 });
  expect(errores).toEqual([]);
});

test('el widget de inicio coincide con el motor y abre el simulador con su estado', async ({ page }) => {
  await ir(page);
  await expect(page.locator('#demoP')).toHaveText('51.6%');
  await page.locator('#demoClientes').fill('120');
  await expect(page.locator('#demoClientesV')).toHaveText('120');
  const pDemo = await page.locator('#demoP').textContent();
  await page.click('#demoAbrir');
  await expect(page.locator('#clientes')).toHaveValue('120');
  await page.waitForTimeout(1200);
  await expect(page.locator('#probNum')).toHaveText(pDemo);
});

test('mapa 2.5D: la lista se navega con teclado y la ficha muestra la procedencia', async ({ page }) => {
  await ir(page);
  await expect(page.locator('#mapa25Lista li')).toHaveCount(6);
  await page.locator('#mapa25Lista').focus();
  await page.keyboard.press('Home');
  await expect(page.locator('#mapa25Lista li').first()).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#mapa25Ficha')).toContainText('estimación del equipo');
  await expect(page.locator('#mapa25Ficha')).toContainText('resultado del modelo');
  const zona = await page.locator('#mapa25Lista li').first().getAttribute('data-zona');
  await page.click('#mapa25Abrir');
  await expect(page.locator('#zona')).toHaveValue(zona);
});

test('escenario vigente y restablecer referencia', async ({ page }) => {
  await ir(page);
  await expect(page.locator('#evNombre')).toContainText('Cafetería');
  await page.locator('#experiencia').selectOption('0.38', { force: true });
  await page.waitForTimeout(1200);
  await expect(page.locator('#probNum')).not.toHaveText('51.6%');
  await page.click('#restablecer');
  await expect(page.locator('#probNum')).toHaveText('51.6%', { timeout: 5000 });
  await expect(page.locator('#escVigente')).toHaveAttribute('data-estado', 'vigente');
});

test('supervivencia por año y meta de Monte Carlo responden', async ({ page }) => {
  await ir(page);
  await expect(page.locator('#supTabla')).toContainText('51.6%');
  await page.locator('#supAnio').fill('5');
  await expect(page.locator('#supAnioV')).toHaveText('5');
  await page.locator('#mcMeta').fill('0');
  await expect(page.locator('#mcRespuesta')).toContainText('2,000 de 2,000');
});

test('superficie: lectura exacta, teclado y vista plana', async ({ page }) => {
  await ir(page);
  await expect(page.locator('#supLectura')).toContainText('$60,371');
  await page.locator('.celda25.centro').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#supLectura')).not.toContainText('= 60 ');
  await page.check('#supPlano');
  await expect(page.locator('#supEscena')).toHaveClass(/plana/);
  await page.selectOption('#supEjeY', 'mu');
  await expect(page.locator('#wSuperficie')).toHaveAttribute('data-estado', 'vacio');
});

test('trazabilidad: de un resultado a su fuente', async ({ page }) => {
  await ir(page);
  await page.locator('#trazaLista li[data-id="sector"]').click();
  await expect(page.locator('#trazaRuta')).toContainText('DENUE 05/2026');
  await expect(page.locator('#trazaRuta a')).toHaveAttribute('href', /inegi\.org\.mx/);
  await page.locator('#trazaLista').focus();
  await page.keyboard.press('Home');
  await expect(page.locator('#trazaRuta')).toContainText('Probabilidad a 3 años');
});

test.describe('movimiento reducido', () => {
  test('la superficie arranca en vista plana con la misma información', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ir(page);
    await expect(page.locator('#supEscena')).toHaveClass(/plana/);
    await expect(page.locator('#supCorte tbody tr')).toHaveCount(9);
  });
});
