// Páginas por apartado, describir la situación, giros SCIAN y costos propios.
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

test('asistente: siempre visible, responde con el motor y ajusta el simulador', async ({ page }) => {
  for (const ruta of ['/', '/#denue', '/#legal']) {
    await page.goto(ruta, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#asisAbrir')).toBeVisible();
  }
  await page.click('#asisAbrir');
  await page.click('#asisChips button:has-text("¿Cómo voy?")');
  await expect(page.locator('#asisLog')).toContainText('51.6%');
  await page.fill('#asisTexto', 'farmacia en Villa de las Flores con 90 clientes al día');
  await page.press('#asisTexto', 'Enter');
  await expect(page.locator('#giro')).toHaveValue('farmacia');
  await expect(page.locator('#clientes')).toHaveValue('90');
  await page.click('#asisChips button:has-text("zona")');
  await expect(page.locator('#asisLog .bot').last()).toContainText('1.');
  await page.fill('#asisTexto', 'abre el DENUE');
  await page.press('#asisTexto', 'Enter');
  await expect(page.locator('#denue')).toBeVisible();
});

test('asistente con clave de Gemini: pregunta libre por REST, sin guardar', async ({ page }) => {
  let cuerpo = null, clave = null;
  await page.route('https://generativelanguage.googleapis.com/**', async (ruta) => {
    cuerpo = ruta.request().postDataJSON(); clave = ruta.request().headers()['x-goog-api-key'];
    await ruta.fulfill({ json: { steps: [{ type: 'model_output', content: [{ type: 'text', text: 'Respuesta <b>simulada</b> de Gemini.' }] }] } });
  });
  await page.goto('/#simulador', { waitUntil: 'domcontentloaded' });
  await page.click('.describir-ia summary');
  await page.fill('#descClave', 'AIza-prueba');
  await page.locator('#descClave').dispatchEvent('change');
  await page.click('#asisAbrir');
  await page.fill('#asisTexto', '¿Qué opinas de la competencia en mi zona?');
  await page.press('#asisTexto', 'Enter');
  await expect(page.locator('#asisLog .bot').last()).toHaveText('Respuesta <b>simulada</b> de Gemini.');  // escapado, no HTML
  await expect(page.locator('#asisModo')).toHaveText('Gemini (tu clave)');
  expect(clave).toBe('AIza-prueba');
  expect(cuerpo.store).toBe(false);
  expect(cuerpo.system_instruction).toContain('Cafetería');
});

test('Gemini: cambia de modelo si no está disponible y explica el límite gratuito', async ({ page }) => {
  const modelos = []; let limite = false;
  await page.route('https://generativelanguage.googleapis.com/**', async (ruta) => {
    const m = ruta.request().postDataJSON().model; modelos.push(m);
    if (limite) return ruta.fulfill({ status: 429, json: { error: { message: 'Resource exhausted' } } });
    if (m === 'gemini-3.8-flash') return ruta.fulfill({ status: 404, json: { error: { message: 'not found' } } });
    await ruta.fulfill({ json: { steps: [{ type: 'model_output', content: [{ type: 'text', text: 'Hola desde el modelo de respaldo.' }] }] } });
  });
  await page.goto('/#simulador', { waitUntil: 'domcontentloaded' });
  await page.click('.describir-ia summary');
  await page.fill('#descClave', 'AIza-prueba');
  await page.locator('#descClave').dispatchEvent('change');
  await page.click('#asisAbrir');
  await page.fill('#asisTexto', '¿Qué opinas de mi competencia?');
  await page.press('#asisTexto', 'Enter');
  await expect(page.locator('#asisLog .bot').last()).toHaveText('Hola desde el modelo de respaldo.');
  expect(modelos).toEqual(['gemini-3.8-flash', 'gemini-3.5-flash-lite']);
  limite = true;
  await page.fill('#asisTexto', '¿Y la demanda?');
  await page.press('#asisTexto', 'Enter');
  await expect(page.locator('#asisLog .bot').last()).toContainText('límite del plan gratuito');
});

test('describe tu negocio con clave de Gemini: JSON validado ajusta el simulador', async ({ page }) => {
  let cuerpo = null;
  await page.route('https://generativelanguage.googleapis.com/**', async (ruta) => {
    cuerpo = ruta.request().postDataJSON();
    const j = { giro: 'farmacia', zona: 'no_existe', clientes: 90, ticket: '120', inversion: null, renta: 9000, empleados: null,
      costoEmpleado: null, superficie: null, credito: null, tasa: null, experiencia_anios: 4, resumen: 'Farmacia con 90 clientes.' };
    await ruta.fulfill({ json: { steps: [{ type: 'model_output', content: [{ type: 'text', text: '```json\n' + JSON.stringify(j) + '\n```' }] }] } });
  });
  await page.goto('/#simulador', { waitUntil: 'domcontentloaded' });
  await page.click('.describir-ia summary');
  await page.fill('#descClave', 'AIza-prueba');
  await page.locator('#descClave').dispatchEvent('change');
  await expect(page.locator('#descModo')).toContainText('Gemini');
  await page.fill('#descTexto', 'Una farmacia con 90 clientes al día');
  await page.click('#descAplicar');
  await expect(page.locator('#giro')).toHaveValue('farmacia');
  await expect(page.locator('#clientes')).toHaveValue('90');
  await expect(page.locator('#renta')).toHaveValue('9000');
  await expect(page.locator('#descEntendido')).not.toContainText('ticket');   // "120" como texto se descarta
  await expect(page.locator('#ticket')).not.toHaveValue('120');
  await expect(page.locator('#wDescribir-estado')).toContainText('con Gemini');
  expect(cuerpo.store).toBe(false);
  expect(cuerpo.system_instruction).toContain('JSON');
});

test('giro propio con cualquier nombre', async ({ page }) => {
  await page.goto('/#simulador', { waitUntil: 'domcontentloaded' });
  await page.fill('#giroBusca', 'Vivero de suculentas');
  await page.dispatchEvent('#giroBusca', 'change');
  await expect(page.locator('#giro')).toHaveValue(/^propio_/);
  await expect(page.locator('#giroNota')).toContainText('Giro propio');
});

test('cada apartado abierto queda como pestaña que se cambia y se cierra', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.click('.nav-links a[data-vista="simulador"]');
  await page.click('.nav-links a[data-vista="denue"]');
  const tabs = page.locator('#pestanasApp .pa-tab');
  await expect(tabs).toHaveCount(3);
  await expect(page.locator('#pestanasApp .activa')).toHaveText(/DENUE/);
  await page.click('#pestanasApp a[href="#simulador"]');
  await expect(page.locator('#simulador')).toBeVisible();
  await page.click('#pestanasApp [data-cerrar="simulador"]');
  await expect(tabs).toHaveCount(2);
  await expect(page.locator('#denue')).toBeVisible();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(tabs).toHaveCount(2);
});

test('contraste con el censo: dato oficial por giro y opción de aplicarlo', async ({ page }) => {
  await page.goto('/#simulador', { waitUntil: 'domcontentloaded' });
  const caja = page.locator('#censoRef');
  await expect(caja).toBeVisible({ timeout: 15000 });
  await expect(caja).toContainText('241');            // cafeterías de 0 a 10 personas en Coacalco (CE 2019)
  await expect(page.locator('#probNum')).toHaveText('51.6%');   // los valores por defecto no cambian
  await page.click('#censoAplicar');
  await expect(page.locator('#cvar')).toHaveValue('48');
  await expect(page.locator('#probNum')).not.toHaveText('51.6%');
});

test('mapa real: límites oficiales de AGEB del INEGI', async ({ page }) => {
  await page.goto('/#mapa', { waitUntil: 'domcontentloaded' });
  await page.locator('#mapa').scrollIntoViewIfNeeded();   // el mapa real se carga al entrar en pantalla
  await expect(page.locator('#mapaReal path.leaflet-interactive')).toHaveCount(70, { timeout: 20000 });
});
