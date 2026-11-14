// Datos simulados y distintivos para detectar filtraciones del archivo de Empresas.
import { test, expect } from '@playwright/test';

test('Empresas: el asistente de Gemini no envía datos del archivo cargado', async ({ page }) => {
  const nombre = 'historial-confidencial-simulado.csv';
  const filas = Array.from({ length: 6 }, (_, i) =>
    [`periodo-reservado-${i + 1}`, 743219 + i * 131, 2179 + i * 13, 291137 + i * 73, 46283 + i * 19]);
  const csv = ['mes,ventas,clientes,costo_variable,costos_fijos', ...filas.map((fila) => fila.join(','))].join('\n');
  const cuerpos = [];
  await page.route('https://generativelanguage.googleapis.com/**', async (ruta) => {
    cuerpos.push(ruta.request().postDataJSON());
    await ruta.fulfill({ json: { steps: [{ type: 'model_output', content: [{ type: 'text', text: 'Respuesta simulada sin datos confidenciales.' }] }] } });
  });

  await page.goto('/#empresas', { waitUntil: 'domcontentloaded' });
  await page.setInputFiles('#empArchivo', { name: nombre, mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await expect(page.locator('#wEmpresa')).toHaveAttribute('data-estado', 'listo');
  await expect(page.locator('#empResultados')).toBeVisible();
  await expect(page.locator('#empSerie')).toContainText(filas[0][0]);

  await page.evaluate(() => { location.hash = '#simulador'; });
  await page.click('.describir-ia summary');
  await page.fill('#descClave', 'AIza-prueba');
  await page.locator('#descClave').dispatchEvent('change');
  await page.click('#asisAbrir');
  const pregunta = '¿Qué opinas de la competencia en mi zona?';
  await page.fill('#asisTexto', pregunta);
  await page.press('#asisTexto', 'Enter');
  await expect(page.locator('#asisLog .bot').last()).toHaveText('Respuesta simulada sin datos confidenciales.');
  await expect(page.locator('#asisModo')).toHaveText('Gemini (tu clave)');

  expect(cuerpos).toHaveLength(1);
  expect(cuerpos[0].input).toBe(pregunta);
  expect(cuerpos[0].store).toBe(false);
  expect(cuerpos[0].system_instruction).toContain('Cafetería');
  for (const cuerpo of cuerpos) {
    const enviado = JSON.stringify(cuerpo);
    expect(enviado).not.toContain(nombre);
    expect(enviado).not.toContain(csv);
    for (const dato of filas.flat()) {
      expect(enviado).not.toContain(String(dato));
      expect(enviado).not.toContain(dato.toLocaleString('es-MX'));
    }
  }
});
