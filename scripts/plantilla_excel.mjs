// Genera la plantilla de Excel del apartado «Para empresas» con la identidad de COATL y una guía de llenado.
// Uso: node scripts/plantilla_excel.mjs          → assets/plantillas/COATL-plantilla-empresa.xlsx
//      node scripts/plantilla_excel.mjs --logo   → además rehace los PNG del logotipo y la greca (requiere Edge/Chromium)
// La hoja «Datos» va SIN datos de ejemplo para que nadie analice cifras ficticias; el ejemplo vive en «Guía».
import fs from 'node:fs';
import ExcelJS from 'exceljs';

const ROJO = 'FFC8102E', GRANATE = 'FF7A0C1F', HUESO = 'FFFBF6F3', NIEBLA = 'FFF4E2E1', NIEBLA2 = 'FFEFD6D4', TINTA = 'FF38070F', GRIS = 'FF4A3A3C', BLANCO = 'FFFFFFFF';
const FUENTE = 'Segoe UI';
const LOGO = 'assets/img/logo-coatl.png', GRECA = 'assets/img/greca-coatl.png', SALIDA = 'assets/plantillas/COATL-plantilla-empresa.xlsx';

if (process.argv.includes('--logo') || !fs.existsSync(LOGO) || !fs.existsSync(GRECA)) {
  const { chromium } = await import('@playwright/test');
  const b = await chromium.launch(process.platform === 'win32' ? { channel: 'msedge' } : {});
  const p = await b.newPage({ deviceScaleFactor: 4 });
  await p.setContent('<body style="margin:0;background:transparent"><svg id="l" width="76" height="76" viewBox="0 0 38 38"><rect width="38" height="38" rx="9" fill="#C8102E"/><path d="M8 27 v-5 h5 v-5 h5 v-5 h12 v5 h-7 v5 h-5 v5 z" fill="#fff"/><circle cx="27.5" cy="14.5" r="1.8" fill="#C8102E"/></svg>' +
    '<svg id="g" width="720" height="18" viewBox="0 0 720 18" style="display:block"><defs><pattern id="p" width="72" height="18" patternUnits="userSpaceOnUse"><path d="M0 18 V12 H6 V6 H12 V0 H24 V6 H18 V12 H12 V18 Z M36 18 V12 H42 V6 H48 V0 H60 V6 H54 V12 H48 V18 Z" fill="#C8102E"/><rect x="28" y="7" width="4" height="4" fill="#C8102E"/><rect x="64" y="7" width="4" height="4" fill="#C8102E"/></pattern></defs><rect width="720" height="18" fill="url(#p)"/></svg></body>');
  await p.locator('#l').screenshot({ path: LOGO, omitBackground: true });
  await p.locator('#g').screenshot({ path: GRECA, omitBackground: true });
  await b.close();
}

const wb = new ExcelJS.Workbook();
wb.creator = 'COATL'; wb.company = 'COATL — Cálculo de Oportunidad y Análisis Territorial Local'; wb.title = 'Plantilla para empresas';
wb.created = new Date(Date.UTC(2026, 10, 16)); wb.modified = wb.created;   // fecha fija: el archivo no cambia si no cambia el script
const logo = wb.addImage({ filename: LOGO, extension: 'png' }), greca = wb.addImage({ filename: GRECA, extension: 'png' });
const relleno = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
const borde = (argb = NIEBLA2) => { const l = { style: 'thin', color: { argb } }; return { top: l, left: l, bottom: l, right: l }; };
const fuente = (o = {}) => ({ name: FUENTE, size: 11, color: { argb: TINTA }, ...o });

function encabezado(ws, titulo, sub, ultimaCol) {
  ws.getRow(1).height = 10; ws.getRow(2).height = 30; ws.getRow(3).height = 20; ws.getRow(4).height = 10; ws.getRow(5).height = 16;
  ws.addImage(logo, { tl: { col: 1.15, row: 1.05 }, ext: { width: 58, height: 58 }, editAs: 'absolute' });
  ws.mergeCells(`C2:${ultimaCol}2`); ws.mergeCells(`C3:${ultimaCol}3`);
  Object.assign(ws.getCell('C2'), { value: titulo, font: fuente({ size: 20, bold: true }), alignment: { vertical: 'middle' } });
  Object.assign(ws.getCell('C3'), { value: sub, font: fuente({ size: 10, bold: true, color: { argb: GRANATE } }), alignment: { vertical: 'middle' } });
  ws.addImage(greca, { tl: { col: 1, row: 4.1 }, ext: { width: 792, height: 15 }, editAs: 'absolute' });
}
function banda(ws, fila, texto, desde, hasta) {
  ws.mergeCells(`${desde}${fila}:${hasta}${fila}`);
  const c = ws.getCell(`${desde}${fila}`);
  Object.assign(c, { value: texto, font: fuente({ size: 12, bold: true, color: { argb: BLANCO } }), fill: relleno(ROJO), alignment: { vertical: 'middle', indent: 1 } });
  ws.getRow(fila).height = 24;
}

/* ================= Hoja 1 · Guía ================= */
const g = wb.addWorksheet('Guía', { properties: { tabColor: { argb: ROJO } }, views: [{ showGridLines: false }], pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 } });
g.columns = [{ width: 2.5 }, { width: 9 }, { width: 24 }, { width: 46 }, { width: 44 }, { width: 30 }];
encabezado(g, 'COATL · Plantilla para empresas', 'ANÁLISIS TERRITORIAL · COACALCO  —  Guía de llenado', 'F');
let f = 7;
banda(g, f++, 'Cómo llenar esta plantilla en 5 pasos', 'B', 'F');
[['Abre la hoja «Datos»', 'Está en la pestaña de abajo, junto a esta guía.'],
 ['Escribe una fila por mes', 'Del mes más antiguo al más reciente. Mínimo 6 meses; lo ideal son 12 o más.'],
 ['Llena solo las celdas blancas', 'La columna «utilidad» es rosa porque se calcula sola: no escribas en ella.'],
 ['Escribe números limpios', 'Sin signo de pesos, sin comas y sin texto: 185000, no $185,000.00.'],
 ['Guarda y sube el archivo', 'En maikolv.github.io/coatl → Empresas → «Elige un archivo». Se lee en tu navegador: no se envía a ningún servidor.']]
  .forEach(([t, d], i) => {
    g.mergeCells(`D${f}:F${f}`);
    Object.assign(g.getCell(`B${f}`), { value: i + 1, font: fuente({ size: 14, bold: true, color: { argb: BLANCO } }), fill: relleno(GRANATE), alignment: { horizontal: 'center', vertical: 'middle' }, border: borde() });
    Object.assign(g.getCell(`C${f}`), { value: t, font: fuente({ bold: true }), fill: relleno(i % 2 ? BLANCO : HUESO), alignment: { vertical: 'middle', wrapText: true, indent: 1 }, border: borde() });
    Object.assign(g.getCell(`D${f}`), { value: d, font: fuente({ color: { argb: GRIS } }), fill: relleno(i % 2 ? BLANCO : HUESO), alignment: { vertical: 'middle', wrapText: true, indent: 1 }, border: borde() });
    g.getRow(f).height = 34; f++;
  });
f++;
banda(g, f++, 'Qué va en cada columna', 'B', 'F');
const cab = ['', 'Columna', 'Qué es', 'De dónde lo saco', 'Ejemplo'];
cab.forEach((t, i) => { if (!i) return; Object.assign(g.getCell(f, i + 2), { value: t, font: fuente({ bold: true, color: { argb: BLANCO } }), fill: relleno(GRANATE), alignment: { vertical: 'middle', indent: 1 }, border: borde(GRANATE) }); });
g.getCell(f, 2).fill = relleno(GRANATE); g.getCell(f, 2).border = borde(GRANATE); g.getRow(f).height = 22; f++;
[['mes', 'El mes de los datos, escrito como AAAA-MM.', 'Tu calendario.', '2025-01'],
 ['ventas', 'Todo lo que vendiste en el mes, en pesos y sin IVA.', 'Cortes de caja, punto de venta, estados de cuenta o facturas emitidas.', 185000],
 ['clientes', 'Opcional. Número de ventas o tickets del mes. Sirve para calcular tu ticket promedio.', 'Punto de venta o conteo de notas.', 1950],
 ['costo_variable', 'Lo que gastaste para producir o comprar lo que vendiste: mercancía, insumos, empaques y comisiones.', 'Facturas de proveedores y notas de compra.', 70300],
 ['costos_fijos', 'Lo que pagas aunque no vendas: renta, sueldos, luz, agua, internet, contador y créditos.', 'Recibos, nómina y estados de cuenta.', 27000],
 ['utilidad', 'ventas − costo_variable − costos_fijos. Se calcula sola.', 'No se captura.', 87700]]
  .forEach((r, i) => {
    const fondo = i % 2 ? BLANCO : HUESO;
    Object.assign(g.getCell(`B${f}`), { value: i + 1, font: fuente({ bold: true, color: { argb: GRANATE } }), fill: relleno(NIEBLA), alignment: { horizontal: 'center', vertical: 'middle' }, border: borde() });
    r.forEach((v, k) => Object.assign(g.getCell(f, k + 3), { value: v, font: fuente(k ? { color: { argb: GRIS } } : { bold: true, name: 'Consolas' }), fill: relleno(fondo), alignment: { vertical: 'middle', wrapText: true, indent: 1, horizontal: k === 3 ? 'right' : 'left' }, border: borde(), numFmt: typeof v === 'number' ? '#,##0' : '@' }));
    g.getRow(f).height = 50; f++;
  });
f++;
banda(g, f++, 'Ejemplo de tres meses (cifras ficticias: no las copies)', 'B', 'F');
[['mes', 'ventas', 'clientes', 'costo_variable / costos_fijos'], ['2025-01', 178000, 1874, '72,980 / 27,000'], ['2025-02', 182000, 1916, '74,620 / 27,000'], ['2025-03', 169000, 1779, '69,290 / 27,000']]
  .forEach((r, i) => { r.forEach((v, k) => Object.assign(g.getCell(f, k + 3), { value: v, font: fuente(i ? { color: { argb: GRIS } } : { bold: true, color: { argb: GRANATE } }), fill: relleno(i ? BLANCO : NIEBLA), alignment: { vertical: 'middle', indent: 1 }, border: borde(), numFmt: typeof v === 'number' ? '#,##0' : '@' })); g.getRow(f).height = 20; f++; });
f++;
banda(g, f++, 'Errores comunes y privacidad', 'B', 'F');
['No cambies los nombres de las columnas ni borres la fila de encabezados de la hoja «Datos».',
 'No dejes meses en blanco en medio. Si un mes no vendiste, escribe 0 en ventas.',
 'No mezcles gastos personales con los del negocio: el resultado dejaría de servir.',
 'Si tus costos fijos cambian (por ejemplo, subió la renta), escribe en cada mes lo que realmente pagaste.',
 'Privacidad: COATL lee este archivo solo en tu navegador. No se envía, no se guarda y se borra al recargar la página.']
  .forEach((t, i) => { g.mergeCells(`C${f}:F${f}`);
    Object.assign(g.getCell(`B${f}`), { value: i === 4 ? '🔒' : '✕', font: fuente({ bold: true, color: { argb: ROJO } }), alignment: { horizontal: 'center', vertical: 'middle' }, fill: relleno(HUESO), border: borde() });
    Object.assign(g.getCell(`C${f}`), { value: t, font: fuente({ color: { argb: GRIS } }), alignment: { vertical: 'middle', wrapText: true, indent: 1 }, fill: relleno(HUESO), border: borde() });
    g.getRow(f).height = 22; f++; });
f++;
g.mergeCells(`B${f}:F${f}`);
Object.assign(g.getCell(`B${f}`), { value: '© 2026 Miguel Antonio Cruz García, Bruno Alejandro López Bautista y Alonso Arroyo Cortés · Herramienta académica: sus resultados no constituyen asesoría financiera, fiscal ni legal.', font: fuente({ size: 8, color: { argb: GRIS } }), alignment: { wrapText: true, vertical: 'middle' } });
g.getRow(f).height = 26;

/* ================= Hoja 2 · Datos ================= */
const d = wb.addWorksheet('Datos', { properties: { tabColor: { argb: GRANATE } }, views: [{ showGridLines: false, state: 'frozen', ySplit: 7 }] });
d.columns = [{ width: 2.5 }, { width: 14 }, { width: 18 }, { width: 14 }, { width: 18 }, { width: 18 }, { width: 22 }];
encabezado(d, 'Historial mensual de tu negocio', 'UNA FILA POR MES · LLENA SOLO LAS CELDAS BLANCAS · MÍNIMO 6 MESES', 'G');
d.getRow(6).height = 8;
const CAB = [['mes', 'AAAA-MM'], ['ventas', 'pesos, sin IVA'], ['clientes', 'opcional'], ['costo_variable', 'pesos'], ['costos_fijos', 'pesos'], ['utilidad', 'se calcula sola']];
CAB.forEach(([n, nota], i) => {
  const c = d.getCell(7, i + 2);
  Object.assign(c, { value: n, font: fuente({ bold: true, color: { argb: BLANCO } }), fill: relleno(i === 5 ? GRANATE : ROJO), alignment: { horizontal: 'center', vertical: 'middle' }, border: borde(GRANATE) });
  c.note = { texts: [{ text: nota }] };
});
d.getRow(7).height = 26;
const MESES = 36, numero = { type: 'decimal', operator: 'greaterThanOrEqual', allowBlank: true, formulae: [0], showErrorMessage: true, errorStyle: 'error', errorTitle: 'Dato no válido', error: 'Escribe un número mayor o igual a 0, sin signo de pesos, sin comas y sin texto.' };
for (let i = 0; i < MESES; i++) {
  const r = 8 + i, fondo = i % 2 ? HUESO : BLANCO;
  for (let k = 0; k < 5; k++) {
    const c = d.getCell(r, k + 2);
    Object.assign(c, { font: fuente(), fill: relleno(fondo), border: borde(), alignment: { horizontal: k ? 'right' : 'center', vertical: 'middle' }, numFmt: k === 0 ? '@' : k === 2 ? '#,##0' : '"$"#,##0' });
    if (k) c.dataValidation = numero;
    else c.dataValidation = { type: 'textLength', operator: 'lessThanOrEqual', allowBlank: true, formulae: [10], showInputMessage: true, promptTitle: 'Mes', prompt: 'Escribe el mes como AAAA-MM, por ejemplo 2025-01.' };
  }
  Object.assign(d.getCell(r, 7), { value: { formula: `IF(C${r}="","",C${r}-E${r}-F${r})`, result: '' }, font: fuente({ bold: true, color: { argb: GRANATE } }), fill: relleno(NIEBLA), border: borde(), alignment: { horizontal: 'right', vertical: 'middle' }, numFmt: '"$"#,##0' });
  d.getRow(r).height = 19;
}
d.mergeCells(`B${8 + MESES + 1}:G${8 + MESES + 1}`);
Object.assign(d.getCell(`B${8 + MESES + 1}`), { value: '¿Dudas? Revisa la hoja «Guía». COATL lee este archivo solo en tu navegador: no se envía a ningún servidor.', font: fuente({ size: 9, color: { argb: GRIS } }), alignment: { wrapText: true } });

fs.mkdirSync('assets/plantillas', { recursive: true });
await wb.xlsx.writeFile(SALIDA);
console.log(SALIDA, 'generada ·', fs.statSync(SALIDA).size.toLocaleString('es-MX'), 'bytes · hojas: Guía, Datos');
