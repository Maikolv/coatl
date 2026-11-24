import { test, expect } from '@playwright/test';

// Las fotos del carrusel quedan fuera de la vista horizontal; deben cargarse al acercarse, no aparecer en blanco al avanzar.
test('todas las fotos de los carruseles cargan', async ({ page }) => {
  await page.goto('/?vista=todo');
  for (const c of await page.locator('.carrusel').all()) {
    await c.scrollIntoViewIfNeeded();
    await expect.poll(() => c.locator('img').evaluateAll((imgs) =>
      imgs.filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.src.split('/').pop())), { timeout: 15000 }).toEqual([]);
  }
});
