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
