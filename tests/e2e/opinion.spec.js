import { test, expect } from '@playwright/test';

test('la opinión arma un correo al contacto del equipo sin enviar nada por su cuenta', async ({ page }) => {
  await page.goto('/#opinion');
  const enviar = page.locator('#opEnviar');
  await expect(page.locator('#wOpinion')).toHaveAttribute('data-estado', 'vacio');
  await enviar.click();
  await expect(page.locator('#wOpinion')).toHaveAttribute('data-estado', 'error');
  await page.locator('label:has(input[name="opUtil"][value="4"])').click();
  await page.selectOption('#opApartado', 'Simulador');
  await page.fill('#opMejora', 'Agregaría más giros & zonas');
  await expect(page.locator('#wOpinion')).toHaveAttribute('data-estado', 'listo');
  const href = await enviar.getAttribute('href');
  expect(href.startsWith('mailto:A660136406@my.uvm.edu.mx?subject=')).toBe(true);
  const cuerpo = decodeURIComponent(href.split('&body=')[1]);
  expect(cuerpo).toContain('Utilidad: 4 de 5');
  expect(cuerpo).toContain('Apartado favorito: Simulador');
  expect(cuerpo).toContain('Agregaría más giros & zonas');
  await expect(page.locator('#creditos a[href="mailto:A660136406@my.uvm.edu.mx"]')).toHaveCount(1);
});

test('«Danos tu opinión» del pie lleva hasta la sección, no al inicio de la página', async ({ page }) => {
  await page.goto('/');
  await page.locator('#creditos a[href="#opinion"]').click();
  await expect(page.locator('#opinion h2')).toBeInViewport();
  // El título no queda tapado por la barra superior fija.
  // Se espera a que la página se asiente: el sitio vuelve a alinear el destino si algo de arriba cambia de alto.
  await page.waitForTimeout(2500);
  await expect.poll(() => page.evaluate(() => {
    const titulo = document.querySelector('#opinion h2').getBoundingClientRect().top;
    const barra = Math.max(...[...document.querySelectorAll('header, nav, #pestanasApp')].filter((e) => getComputedStyle(e).position.match(/sticky|fixed/)).map((e) => e.getBoundingClientRect().bottom), 0);
    return titulo - barra; })).toBeGreaterThanOrEqual(-1);
});
