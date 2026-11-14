// Teléfono en vertical y en horizontal: ningún apartado se desborda ni deja elementos fuera de la pantalla.
import { test, expect } from '@playwright/test';

const PAGINAS = ['inicio', 'contexto', 'denue', 'simulador', 'empresas', 'estrategia', 'metodologia', 'legal'];
const ORIENTACIONES = { vertical: { width: 390, height: 844 }, horizontal: { width: 844, height: 390 }, 'horizontal pequeño': { width: 667, height: 375 } };

for (const [nombre, viewport] of Object.entries(ORIENTACIONES)) {
  test.describe(`teléfono ${nombre}`, () => {
    test.use({ viewport, isMobile: true, hasTouch: true });
    for (const pag of PAGINAS) {
      test(`${pag}: sin desbordes ni elementos cortados`, async ({ page }, info) => {
        test.skip(info.project.name !== 'movil', 'basta con correrla una vez');
        await page.goto('/#' + pag, { waitUntil: 'load' });
        await page.evaluate(() => document.querySelectorAll('.revela').forEach((e) => e.classList.add('visible')));
        await page.waitForTimeout(1200);
        const r = await page.evaluate(() => {
          const W = document.documentElement.clientWidth;
          // Un elemento puede salirse si vive dentro de un contenedor con desplazamiento horizontal propio (tablas, pestañas).
          const enScroll = (el) => { for (let p = el.parentElement; p; p = p.parentElement) {
            const s = getComputedStyle(p); if (/(auto|scroll|hidden|clip)/.test(s.overflowX) && p.scrollWidth > p.clientWidth - 1) return true; } return false; };
          const fuera = [];
          for (const el of document.querySelectorAll('main *, nav *, .asis *')) {
            const s = getComputedStyle(el); if (s.display === 'none' || s.visibility === 'hidden' || s.position === 'fixed' && el.closest('[hidden]')) continue;
            const b = el.getBoundingClientRect(); if (!b.width || !b.height) continue;
            if ((b.right > W + 1 || b.left < -1) && !enScroll(el)) fuera.push((el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + [...el.classList].join('.')) + ` [${Math.round(b.left)}–${Math.round(b.right)}]`);
          }
          return { desborde: document.documentElement.scrollWidth - W, fuera: [...new Set(fuera)].slice(0, 15) };
        });
        expect(r.desborde, 'la página no debe desplazarse a lo ancho').toBeLessThanOrEqual(1);
        expect(r.fuera).toEqual([]);
        await expect(page.locator('#asisAbrir')).toBeInViewport();
        await expect(page.locator(`section[data-pagina="${pag}"], #${pag}`).first()).toBeVisible();
      });
    }
  });
}

test('al girar el teléfono, la barra fija ocupa poco y la tira de pestañas se reacomoda', async ({ page }, info) => {
  test.skip(info.project.name !== 'movil', 'basta con correrla una vez');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#simulador', { waitUntil: 'load' });
  const tope = () => page.locator('#pestanasApp').evaluate((e) => parseFloat(e.style.top));
  expect(await tope()).toBeGreaterThan(50);                 // vertical: debajo de la barra fija
  await page.setViewportSize({ width: 667, height: 375 });  // girar
  await expect.poll(tope).toBe(0);
  await page.evaluate(() => window.scrollTo(0, 800));
  const fijo = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => {
    const s = getComputedStyle(e); if (!/sticky|fixed/.test(s.position) || e.closest('.asis')) return false;
    const b = e.getBoundingClientRect(); return b.top < 5 && b.bottom > 0; }).reduce((m, e) => Math.max(m, e.getBoundingClientRect().bottom), 0));
  expect(fijo, 'lo fijo arriba no debe tapar más de una cuarta parte').toBeLessThan(375 / 4);
  await page.setViewportSize({ width: 390, height: 844 });  // regresar a vertical
  await expect.poll(tope).toBeGreaterThan(50);
});
