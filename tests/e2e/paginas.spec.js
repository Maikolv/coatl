// Páginas por apartado, describir la situación, giros SCIAN y costos propios.
import { test, expect } from '@playwright/test';

const visibles = (page) => page.evaluate(() => [...document.querySelectorAll('[data-pagina]')].filter((s) => !s.hidden).map((s) => s.id));

test('cada apartado se abre como página propia y respeta atrás/adelante', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(await visibles(page)).toEqual(['inicio', 'explorar']);
  await page.click('.nav-links a[data-vista="simulador"]');
  await expect(page.locator('#simulador')).toBeVisible();
  expect(await visibles(page)).toEqual(['simulador', 'mejora']);
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
  expect(await visibles(page)).toEqual(['simulador', 'mejora']);
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
  await expect(page.locator('#probNum')).toHaveText('38.0%');
  await page.click('#t-finanzas');
  for (let i = 0; i < 3; i++) {
    // Cada captura dispara un recálculo en vivo: se espera a que termine antes del siguiente clic
    // (en CI, un clic dado a medio recálculo llegó a perderse y el total quedaba en $40,000).
    await expect(page.locator('html')).toHaveAttribute('data-calculo', 'listo');   // indicador «cálculo listo»
    await page.click('#extrasAgregar');
    await expect(page.locator('#extrasLista li')).toHaveCount(i + 1);
    await page.locator('#extrasLista li').last().locator('input[type=number]').fill('20000');
    await expect(page.locator('#extrasTotal')).toHaveText('$' + (20 * (i + 1)) + ',000');
  }
  await expect(page.locator('#extrasTotal')).toHaveText('$60,000');
  await expect(page.locator('#probNum')).not.toHaveText('38.0%', { timeout: 5000 });
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
  await expect(page.locator('#asisLog')).toContainText('38.0%');
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
  await expect(page.locator('input[type="password"]:not(#perfilClave), #descClave')).toHaveCount(0);   // no se pide clave de IA (la de #perfilClave es la del perfil local)
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
  await expect(page.locator('#asisLog .bot').last()).toContainText('38.0%');   // el motor local sigue respondiendo
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
  await expect(page.locator('#probNum')).toHaveText('38.0%');   // los valores por defecto no cambian
  await page.click('#censoAplicar');
  await expect(page.locator('#cvar')).toHaveValue('48');
  await expect(page.locator('#probNum')).not.toHaveText('38.0%');
});

test('mapa real: límites oficiales de AGEB del INEGI', async ({ page }) => {
  await page.goto('/#mapa', { waitUntil: 'domcontentloaded' });
  await page.locator('#mapa').scrollIntoViewIfNeeded();   // el mapa real se carga al entrar en pantalla
  await expect(page.locator('#mapaReal path.leaflet-interactive')).toHaveCount(70, { timeout: 20000 });
});

test('v9: extorsión y variables emocionales cambian el resultado; el pago de piso baja la utilidad', async ({ page }) => {
  await page.goto('/#simulador', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#probNum')).toHaveText('38.0%');   // neutras por defecto
  const util = page.locator('#kpis .kpi', { hasText: 'Utilidad mensual esperada' }).locator('.v');
  await expect(util).toHaveText('$60,371');
  await page.click('#t-ubicacion');
  await page.selectOption('#extorsion', '-0.45');
  await expect(page.locator('#probNum')).not.toHaveText('38.0%');
  await page.selectOption('#extorsion', '0');
  await expect(page.locator('#probNum')).toHaveText('38.0%');
  await page.fill('#cobroPiso', '5000');
  await page.locator('#cobroPiso').dispatchEvent('input');
  await expect(util).toHaveText('$55,371');   // la cuota sale completa de la utilidad
  await page.fill('#cobroPiso', '0'); await page.locator('#cobroPiso').dispatchEvent('input');
  await page.click('#t-negocio');
  await page.selectOption('#resiliencia', '-0.15');
  await expect(page.locator('#probNum')).not.toHaveText('38.0%');
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

test('v11: carruseles en Inicio y Territorio con fotos distintas; sin fotos en DENUE, Simulador, Empresas, Estrategia ni Aviso legal', async ({ page }) => {
  await page.goto('/?vista=todo', { waitUntil: 'load' });
  for (const id of ['#carrusel-inicio', '#carrusel-territorio']) {
    await page.locator(id).scrollIntoViewIfNeeded();
    await expect(page.locator(id + ' .car-slide').first()).toBeVisible();
    await page.locator(id + ' .car-pausa').click();
    await expect(page.locator(id + ' .car-pausa')).toHaveAttribute('aria-pressed', 'true');
    await page.locator(id + ' .car-sig').click();
    await expect(page.locator(id + ' .car-punto[aria-current="true"]')).toHaveCount(1);
  }
  const fuentes = await page.locator('.car-slide img').evaluateAll((im) => im.map((x) => x.getAttribute('src')));
  expect(new Set(fuentes).size).toBe(fuentes.length);
  for (const sel of ['#denue', '#simulador', '#mejora', '#empresas', '#estrategia', '#legal', '#lectura']) await expect(page.locator(sel + ' img:not(.ico-mic)')).toHaveCount(0);   // el micrófono de «Dictar» es un icono, no una foto
  await expect(page.locator('.folio').filter({ hasText: /Sección \d/ })).toHaveCount(0);
  await expect(page.locator('#fodaBalance')).toBeAttached();
});

test('v9: ninguna foto del sitio se repite y todas cargan', async ({ page }) => {
  await page.goto('/?vista=todo', { waitUntil: 'load' });
  const fotos = await page.locator('img[src*="assets/img/"]:not(.ico-mic)').evaluateAll((i) => i.map((x) => x.getAttribute('src')));
  expect(new Set(fotos).size).toBe(fotos.length);
  for (const f of new Set(fotos)) expect((await page.request.get(f)).status(), f).toBe(200);
});

test('v10: simulador de plan, matriz de impacto y calendario de 90 días', async ({ page }) => {
  await page.goto('/?vista=todo#estrategia', { waitUntil: 'load' });
  for (const w of ['wPlan', 'wRiesgo', 'wCalendario']) await expect(page.locator('#' + w)).toHaveAttribute('data-estado', 'listo');
  await expect(page.locator('#planRes')).toContainText('38.0% →');
  const antes = await page.locator('#planRes strong').textContent();
  await page.locator('#planOpciones input:checked').first().click();
  await expect(page.locator('#planRes strong')).not.toHaveText(antes);
  await expect(page.locator('#planOpciones input:checked').first()).toBeAttached();
  await expect(page.locator('#matrizRiesgo .mr-celda')).toHaveCount(4);
  await expect(page.locator('#wRiesgo')).toContainText('no está medida');
  await expect(page.locator('#calendario > li')).toHaveCount(4);
  // Al desmarcar todo, el calendario queda vacío con mensaje (sin hueco)
  // La lista se vuelve a dibujar en cada cambio: se hace clic y se espera a que baje el conteo (uncheck() revisaría un nodo ya reemplazado).
  for (let n = await page.locator('#planOpciones input:checked').count(); n > 0; n--) {
    await page.locator('#planOpciones input:checked').first().click();
    await expect(page.locator('#planOpciones input:checked')).toHaveCount(n - 1);
  }
  await expect(page.locator('#wCalendario')).toHaveAttribute('data-estado', 'vacio');
  // PDF del plan: un documento propio (no la página impresa), con la marca y las secciones del plan
  await page.evaluate(() => { window.print = () => { window.__imprimio = true; }; });
  await page.click('#imprimirPlan');
  await expect.poll(() => page.evaluate(() => window.__imprimio === true)).toBe(true);
  const plan = page.locator('#reporteNegocio');
  for (const t of ['Plan del negocio', 'Diagnóstico FODA', 'Plan de acción priorizado', 'Qué factores pesan más']) await expect(plan).toContainText(t);
  await page.emulateMedia({ media: 'print' });
  await expect(plan).toBeVisible();
  await expect(page.locator('main')).toBeHidden();
});

test('v12: el menú usa los mismos nombres que las pestañas; micrófono, video y grecas del pie', async ({ page }) => {
  await page.goto('/#legal', { waitUntil: 'load' });
  for (const [vista, nombre] of [['denue', 'DENUE nacional'], ['empresas', 'Para empresas'], ['legal', 'Aviso legal'], ['simulador', 'Simulador']]) {
    await page.click(`.nav-links a[data-vista="${vista}"]`);
    await expect(page.locator(`.nav-links a[data-vista="${vista}"]`)).toHaveText(nombre);
    await expect(page.locator('#pestanasApp .pa-tab.activa a')).toHaveText(nombre);
  }
  await expect(page.locator('#descVoz img.ico-mic')).toBeVisible();
  expect((await page.request.get('assets/img/iconos/microfono.webp')).status()).toBe(200);
  await expect(page.locator('#creditos .pie-greca')).toHaveCount(2);
  await page.click('.nav-links a[data-vista="inicio"]');
  const video = page.locator('#videoCoatl');
  await expect(video).toHaveAttribute('preload', 'none');
  await expect(video.locator('track[kind="captions"]')).toHaveCount(1);
  for (const f of ['assets/video/poster.jpg', 'assets/video/coatl.vtt']) expect((await page.request.get(f)).status(), f).toBe(200);
});

test('v12: el aviso legal no deja huecos entre sus dos columnas', async ({ page }, info) => {
  test.skip(info.project.name === 'movil', 'en teléfono hay una sola columna');
  await page.goto('/#legal', { waitUntil: 'load' });
  await expect(page.locator('#legal .legal-col').nth(1)).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const cols = [...document.querySelectorAll('#legal .legal-col')];
    // offsetTop/offsetHeight: miden la maqueta sin la animación de aparición (translateY) de los artículos
    return cols.map((c) => Math.max(0, Math.round(c.offsetHeight - (c.lastElementChild.offsetTop - c.offsetTop + c.lastElementChild.offsetHeight)) - 1)).concat(Math.max(0, Math.abs(cols[0].offsetHeight - cols[1].offsetHeight) - 1)).join();
  })).toBe('0,0,0');
  const nums = await page.locator('#legal article.metodo').evaluateAll((a) => a.map((x) => x.dataset.num));
  expect(nums).toEqual(nums.map((_, i) => '§' + (i + 1)));
});

test('v12: el código QR lleva el resultado y abre el reporte completo', async ({ page, context }) => {
  await page.goto('/#simulador', { waitUntil: 'load' });
  await expect(page.locator('#probNum')).toHaveText('38.0%');
  await page.fill('#negocioNombre', 'Café La Serpiente');
  await page.click('#t-ubicacion'); await page.selectOption('#zona', 'centro');
  await expect(page.locator('#probNum')).toHaveText('45.8%');
  await page.click('#qrResultado');
  await expect(page.locator('#dlgQR')).toBeVisible();
  const url = await page.locator('#dlgQR').getAttribute('data-url');
  expect(url).toMatch(/^https:\/\/maikolv\.github\.io\/coatl\/\?reporte=1#r=[A-Za-z0-9_-]+$/);
  expect(url.length).toBeLessThan(400);
  // El lienzo tiene módulos oscuros y claros (el QR sí se dibujó)
  expect(await page.evaluate(() => { const c = document.getElementById('qrLienzo'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let o = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 128) o++; return o / (d.length / 4); })).toBeGreaterThan(0.15);
  await page.click('#qrCerrar');
  // Lo que abre el teléfono: mismo enlace, servido por el sitio de pruebas
  const tel = await context.newPage();
  await tel.goto('/' + url.slice(url.indexOf('?')), { waitUntil: 'load' });
  const rep = tel.locator('#reporteNegocio[data-listo="1"]');
  await expect(rep).toBeVisible({ timeout: 60000 });
  for (const t of ['Café La Serpiente', 'Centro', '45.8%', 'Parte 1 · Resultado del simulador', 'Parte 2 · Estrategia y plan de acción', 'Calendario de 90 días']) await expect(rep).toContainText(t);
  await expect(tel.locator('#repGuardar')).toBeVisible();
  expect(await tel.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  // Un enlace dañado no rompe el sitio
  const otra = await context.newPage();   // solo cambia el #: en la misma pestaña el navegador no recargaría
  await otra.goto('/?reporte=1#r=%%%', { waitUntil: 'load' });
  await expect(otra.locator('#reporteNegocio')).toContainText('no contiene un resultado válido');
});

test('v10: aviso legal con uso aceptable, licencias (ODbL) y revisión profesional', async ({ page }) => {
  await page.goto('/?vista=todo#legal', { waitUntil: 'load' });
  const legal = page.locator('#legal');
  for (const t of ['Uso aceptable', 'licencias de terceros', 'ODbL', 'Revisión profesional', 'no ha sido revisado por un abogado', 'Negocios guardados', 'Estimación fiscal']) await expect(legal).toContainText(t);
  await expect(legal.locator('a[href*="docs/RECURSOS.md"]')).toHaveCount(1);
  const nums = await legal.locator('article.metodo').evaluateAll((a) => a.map((x) => x.dataset.num));
  expect(nums).toEqual(nums.map((_, i) => '§' + (i + 1)));
});

test('v11: nombre del negocio, guardado local, alternativas, diagnóstico, fiscal y modelo 2.5D', async ({ page }) => {
  await page.goto('/?vista=todo#simulador', { waitUntil: 'load' });
  for (const w of ['wAlternativas', 'wMadurez', 'wFiscal', 'wEscena', 'wFichaNegocio']) await expect(page.locator('#' + w)).toHaveAttribute('data-estado', 'listo');
  await page.fill('#negocioNombre', 'Café La Serpiente');
  await expect(page.locator('#mejoraNombre')).toContainText('Café La Serpiente');
  await expect(page.locator('#madB-uvp')).toContainText('Café La Serpiente');
  await page.click('#negocioGuardar');
  await expect(page.locator('#negocioLista option')).toHaveCount(2);
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('coatl-negocios-sesion')).length)).toBe(1);   // sin perfil: solo esta pestaña
  expect(await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('coatl-')).length)).toBe(0);
  await expect(page.locator('#madurezNiveles .mad-item')).toHaveCount(30);
  await expect(page.locator('#fiscalCuerpo')).toContainText('RESICO');
  await expect(page.locator('#escenaNegocio svg')).toBeVisible();
  await page.click('#escenaPotencial');
  await expect(page.locator('#escenaPotencial')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-calculo', 'listo');   // cálculo terminado y contador detenido
  await expect(page.locator('#probNum')).toHaveText('38.0%');
  const antes = '38.0%';
  await page.locator('#alternativas button').first().click();
  await expect(page.locator('#altDeshacer')).toBeVisible();
  await expect(page.locator('#probNum')).not.toHaveText(antes);
  await page.click('#altDeshacer');
  await expect(page.locator('#probNum')).toHaveText(antes);
  await page.selectOption('#negocioLista', 'Café La Serpiente');
  await page.click('#negocioEliminar');
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('coatl-negocios-sesion')).length)).toBe(0);
});

test('v13: los negocios guardados quedan aislados por usuario y cifrados', async ({ page, context }) => {
  await page.goto('/#simulador', { waitUntil: 'load' });
  const entrar = async (u, c) => { await page.fill('#perfilUsuario', u); await page.fill('#perfilClave', c); await page.click('#perfilEntrar'); };
  // Ana crea su perfil y guarda un negocio
  await entrar('usuaria-ana', 'clave-ana');
  await expect(page.locator('#perfilSalir')).toBeVisible();
  await page.fill('#negocioNombre', 'Florería de Ana');
  await page.click('#negocioGuardar');
  await expect(page.locator('#negocioLista option')).toHaveCount(2);
  // En el almacenamiento no aparece ni el usuario ni el nombre del negocio
  const crudo = await page.evaluate(() => Object.entries(localStorage).filter(([k]) => k.startsWith('coatl-')).map(([k, v]) => k + v).join(''));
  expect(crudo).not.toContain('Florer'); expect(crudo.toLowerCase()).not.toContain('usuaria-ana'); // texto largo: un cifrado al azar contiene «ana» por casualidad
  await page.click('#perfilSalir');
  await expect(page.locator('#negocioLista option')).toHaveCount(1);
  // Beto, en el mismo navegador, no ve nada de Ana
  await entrar('beto', 'clave-beto');
  await expect(page.locator('#perfilSalir')).toBeVisible();
  await expect(page.locator('#negocioLista option')).toHaveCount(1);
  await page.click('#perfilSalir');
  // Con la clave equivocada no se abre
  await entrar('usuaria-ana', 'otra-clave');
  await expect(page.locator('#negocioNota')).toContainText('incorrectos');
  await expect(page.locator('#perfilSalir')).toBeHidden();
  // Con la correcta, en otra pestaña, Ana recupera su negocio
  const otra = await context.newPage();
  await otra.goto('/#simulador', { waitUntil: 'load' });
  await otra.fill('#perfilUsuario', 'Usuaria-Ana'); await otra.fill('#perfilClave', 'clave-ana'); await otra.click('#perfilEntrar');
  await expect(otra.locator('#negocioLista')).toContainText('Florería de Ana');
});

test('v13: indicador «cálculo listo» en la página', async ({ page }) => {
  await page.goto('/#simulador', { waitUntil: 'domcontentloaded' });
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-calculo', 'listo', { timeout: 20000 });
  const v0 = Number(await html.getAttribute('data-calculo-version'));
  await expect(page.locator('#probNum')).toHaveText('38.0%');
  await page.selectOption('#experiencia', '0.30');   // cambia un β: la probabilidad tiene que moverse
  await expect(html).toHaveAttribute('data-calculo', 'pendiente');
  await expect(html).toHaveAttribute('data-calculo', 'listo');
  expect(Number(await html.getAttribute('data-calculo-version'))).toBeGreaterThan(v0);
  await expect(page.locator('#probNum')).not.toHaveText('38.0%');
});
