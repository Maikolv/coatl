// WCAG 2.1 A/AA con axe-core en cada apartado (escritorio y móvil). Complementa, no sustituye,
// la revisión con un lector de pantalla real (docs/ACCESIBILIDAD.md).
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const v of ['inicio', 'contexto', 'denue', 'simulador', 'empresas', 'estrategia', 'metodologia', 'legal']) {
  test(`axe sin violaciones: ${v}`, async ({ page }) => {
    await page.goto('/#' + v, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await page.evaluate(() => document.querySelectorAll('.revela').forEach((e) => e.classList.add('visible')));
    await page.waitForTimeout(1500);   // que terminen las transiciones de entrada (si no, axe mide colores a medio fundido)
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(r.violations.map((x) => `${x.id}: ${x.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}

test('axe sin violaciones con el asistente abierto', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await page.click('#asisAbrir');
  await page.click('#asisChips button >> nth=0');
  const r = await new AxeBuilder({ page }).include('#asistente').withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(r.violations.map((x) => x.id)).toEqual([]);
});

test('se puede llegar al asistente y usarlo solo con teclado', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await page.locator('#asisAbrir').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#asisTexto')).toBeFocused();
  await page.keyboard.type('¿Cómo voy?');
  await page.keyboard.press('Enter');
  await expect(page.locator('#asisLog')).toContainText('51.6%');
  await page.keyboard.press('Escape');
  await expect(page.locator('#asisPanel')).toBeHidden();
  await expect(page.locator('#asisAbrir')).toBeFocused();
});
