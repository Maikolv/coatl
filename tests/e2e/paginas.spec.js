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

test('cada apartado abre por su nombre (#territorio, pestañas y asistente)', async ({ page }) => {
  await page.goto('/#territorio', { waitUntil: 'load' });
  await expect(page.locator('#contexto')).toBeVisible();
  await expect(page.locator('#explorar')).toBeHidden();
  await page.goto('/#inicio', { waitUntil: 'load' });
  await page.click('#asisAbrir');
  await page.fill('#asisTexto', 'abre el territorio');
  await page.press('#asisTexto', 'Enter');
  await expect(page.locator('#contexto')).toBeVisible();
  await page.click('#pestanasApp a[href="#territorio"]');
  await expect(page.locator('#contexto')).toBeVisible();
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

test('asistente con la IA de COATL: el visitante no pone clave y solo viaja el resumen del escenario', async ({ page }) => {
  const cuerpos = [];
  await page.route('https://coatl-ia.vercel.app/**', async (ruta) => {
    cuerpos.push({ cuerpo: ruta.request().postDataJSON(), cab: ruta.request().headers() });
    await ruta.fulfill({ json: { texto: 'Respuesta <b>simulada</b> de Gemini.' } });
  });
  await page.goto('/?ia=1#simulador', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input[type="password"], #descClave')).toHaveCount(0);   // ya no se pide clave
  await page.click('#asisAbrir');
  await expect(page.locator('#asisModo')).toHaveText('IA de COATL · Gemini');
  await page.fill('#asisTexto', '¿Qué opinas de la competencia en mi zona?');
  await page.press('#asisTexto', 'Enter');
  await expect(page.locator('#asisLog .bot').last()).toHaveText('Respuesta <b>simulada</b> de Gemini.');   // escapado, no HTML
  expect(cuerpos).toHaveLength(1);
  const { cuerpo, cab } = cuerpos[0];
  expect(cuerpo.modo).toBe('asistente');
  expect(cuerpo.contexto.giro).toBe('Cafetería');
  expect(Object.keys(cab).some((k) => /api-key|authorization/i.test(k))).toBe(false);   // ninguna clave sale del navegador
});

test('si la IA de COATL no responde, el asistente avisa y sigue en modo local', async ({ page }) => {
  await page.route('https://coatl-ia.vercel.app/**', (ruta) => ruta.fulfill({ status: 429, json: { error: 'Se alcanzó el límite gratuito de Gemini; intenta en un minuto' } }));
  await page.goto('/?ia=1#simulador', { waitUntil: 'domcontentloaded' });
  await page.click('#asisAbrir');
  await page.fill('#asisTexto', '¿Y la demanda?');
  await page.press('#asisTexto', 'Enter');
  await expect(page.locator('#asisLog .bot').last()).toContainText('límite gratuito');
  await page.click('#asisChips button:has-text("¿Cómo voy?")');
  await expect(page.locator('#asisLog .bot').last()).toContainText('51.6%');   // el motor local sigue respondiendo
});

test('describe tu negocio con la IA de COATL: JSON validado ajusta el simulador', async ({ page }) => {
  let cuerpo = null;
  await page.route('https://coatl-ia.vercel.app/**', async (ruta) => {
    cuerpo = ruta.request().postDataJSON();
    const j = { giro: 'farmacia', zona: 'no_existe', clientes: 90, ticket: '120', inversion: null, renta: 9000, empleados: null,
      costoEmpleado: null, superficie: null, credito: null, tasa: null, experiencia_anios: 4, resumen: 'Farmacia con 90 clientes.' };
    await ruta.fulfill({ json: { texto: '```json\n' + JSON.stringify(j) + '\n```' } });
  });
  await page.goto('/?ia=1#simulador', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#descModo')).toContainText('IA de COATL');
  await page.fill('#descTexto', 'Una farmacia con 90 clientes al día');
  await page.click('#descAplicar');
  await expect(page.locator('#giro')).toHaveValue('farmacia');
  await expect(page.locator('#clientes')).toHaveValue('90');
  await expect(page.locator('#renta')).toHaveValue('9000');
  await expect(page.locator('#descEntendido')).not.toContainText('ticket');   // "120" como texto se descarta
  await expect(page.locator('#wDescribir-estado')).toContainText('IA de COATL');
  expect(cuerpo.modo).toBe('interprete');
  expect(cuerpo.contexto).toContain('Giros válidos');
});

test('describe tu negocio: si la IA falla, el intérprete local hace el trabajo', async ({ page }) => {
  await page.route('https://coatl-ia.vercel.app/**', (ruta) => ruta.abort());
  await page.goto('/?ia=1#simulador', { waitUntil: 'domcontentloaded' });
  await page.fill('#descTexto', 'cafetería en Los Héroes con 70 clientes al día');
  await page.click('#descAplicar');
  await expect(page.locator('#clientes')).toHaveValue('70');
  await expect(page.locator('#wDescribir-estado')).toContainText('intérprete local');
});

test('las pestañas abiertas se reordenan con flechas y arrastrando', async ({ page }) => {
  for (const h of ['inicio', 'territorio', 'denue']) await page.goto('/#' + h, { waitUntil: 'domcontentloaded' });
  const orden = () => page.locator('#pestanasApp .pa-tab').evaluateAll((t) => t.map((x) => x.dataset.id));
  await expect.poll(orden).toEqual(['inicio', 'territorio', 'denue']);
  await page.locator('[data-mover="denue"]').focus();
  await page.keyboard.press('ArrowLeft');
  await expect.poll(orden).toEqual(['inicio', 'denue', 'territorio']);
  await expect(page.locator('#avisoPestanas')).toContainText('posición 2 de 3');
  const asa = page.locator('[data-mover="inicio"]'), destino = page.locator('.pa-tab[data-id="territorio"]');
  const a = await asa.boundingBox(), d = await destino.boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(d.x + d.width - 4, d.y + d.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect.poll(orden).toEqual(['denue', 'territorio', 'inicio']);
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

test('v9: extorsión y variables emocionales cambian el resultado; el pago de piso baja la utilidad', async ({ page }) => {
  await page.goto('/#simulador', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#probNum')).toHaveText('51.6%');   // neutras por defecto
  const util = page.locator('#kpis .kpi', { hasText: 'Utilidad mensual esperada' }).locator('.v');
  await expect(util).toHaveText('$60,371');
  await page.click('#t-ubicacion');
  await page.selectOption('#extorsion', '-0.45');
  await expect(page.locator('#probNum')).not.toHaveText('51.6%');
  await page.selectOption('#extorsion', '0');
  await expect(page.locator('#probNum')).toHaveText('51.6%');
  await page.fill('#cobroPiso', '5000');
  await page.locator('#cobroPiso').dispatchEvent('input');
  await expect(util).toHaveText('$55,371');   // la cuota sale completa de la utilidad
  await page.fill('#cobroPiso', '0'); await page.locator('#cobroPiso').dispatchEvent('input');
  await page.click('#t-negocio');
  await page.selectOption('#resiliencia', '-0.15');
  await expect(page.locator('#probNum')).not.toHaveText('51.6%');
});

test('v9: la lista de giros incluye todas las actividades presentes en Coacalco (DENUE)', async ({ page }) => {
  await page.goto('/#simulador', { waitUntil: 'domcontentloaded' });
  const grupo = page.locator('#giroCoacalcoGrupo');
  await expect(grupo).toHaveCount(1, { timeout: 15000 });
  expect(await grupo.locator('option').count()).toBeGreaterThan(400);
  const valor = await grupo.locator('option').first().getAttribute('value');   // la actividad con más negocios
  await page.selectOption('#giro', valor);
  await expect(page.locator('#giroNota')).toContainText('Actividad real en Coacalco');
  await expect(page.locator('#probNum')).toHaveText(/%/);
});

test('v9: carrusel de zonas con botones, puntos y pausa; sin fotos en Estrategia ni en Aviso legal', async ({ page }) => {
  await page.goto('/#metodologia', { waitUntil: 'domcontentloaded' });
  const puntos = page.locator('.car-punto');
  expect(await puntos.count()).toBeGreaterThanOrEqual(8);
  await page.locator('#carrusel').scrollIntoViewIfNeeded();
  await page.click('#carPausa');
  await expect(page.locator('#carPausa')).toHaveAttribute('aria-pressed', 'true');
  await page.click('#carSig');
  await expect(puntos.nth(1)).toHaveAttribute('aria-current', 'true');
  const fuentes = await page.locator('.car-slide img').evaluateAll((i) => i.map((x) => x.getAttribute('src')));
  expect(new Set(fuentes).size).toBe(fuentes.length);
  await expect(page.locator('#estrategia img')).toHaveCount(0);
  await expect(page.locator('#legal img')).toHaveCount(0);
  await expect(page.locator('#fodaBalance')).toBeAttached();
});

test('v9: ninguna foto del sitio se repite y todas cargan', async ({ page }) => {
  await page.goto('/?vista=todo', { waitUntil: 'load' });
  const fotos = await page.locator('img[src*="assets/img/"]').evaluateAll((i) => i.map((x) => x.getAttribute('src')));
  expect(new Set(fotos).size).toBe(fotos.length);
  for (const f of new Set(fotos)) expect((await page.request.get(f)).status(), f).toBe(200);
});

test('v10: simulador de plan, matriz de impacto y calendario de 90 días', async ({ page }) => {
  await page.goto('/?vista=todo#estrategia', { waitUntil: 'load' });
  for (const w of ['wPlan', 'wRiesgo', 'wCalendario']) await expect(page.locator('#' + w)).toHaveAttribute('data-estado', 'listo');
  await expect(page.locator('#planRes')).toContainText('51.6% →');
  const antes = await page.locator('#planRes strong').textContent();
  await page.locator('#planOpciones input:checked').first().uncheck();
  await expect(page.locator('#planRes strong')).not.toHaveText(antes);
  await expect(page.locator('#planOpciones input:checked').first()).toBeAttached();
  await expect(page.locator('#matrizRiesgo .mr-celda')).toHaveCount(4);
  await expect(page.locator('#wRiesgo')).toContainText('no está medida');
  await expect(page.locator('#calendario > li')).toHaveCount(4);
  // Al desmarcar todo, el calendario queda vacío con mensaje (sin hueco)
  while (await page.locator('#planOpciones input:checked').count()) await page.locator('#planOpciones input:checked').first().uncheck();
  await expect(page.locator('#wCalendario')).toHaveAttribute('data-estado', 'vacio');
  // Impresión: solo Estrategia queda visible
  await page.evaluate(() => document.body.classList.add('imprimir-plan'));
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('#estrategia')).toBeVisible();
  await expect(page.locator('#legal')).toBeHidden();
});

test('v10: aviso legal con uso aceptable, licencias (ODbL) y revisión profesional', async ({ page }) => {
  await page.goto('/?vista=todo#legal', { waitUntil: 'load' });
  const legal = page.locator('#legal');
  for (const t of ['Uso aceptable', 'Licencias de terceros', 'ODbL', 'Revisión profesional', 'no ha sido revisado por un abogado']) await expect(legal).toContainText(t);
  await expect(legal.locator('a[href*="docs/RECURSOS.md"]')).toHaveCount(1);
  const nums = await legal.locator('article.metodo').evaluateAll((a) => a.map((x) => x.dataset.num));
  expect(nums).toEqual(nums.map((_, i) => '§' + (i + 1)));
});
