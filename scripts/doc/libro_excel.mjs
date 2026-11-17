// Libro técnico de COATL en Excel: todas las tablas del proyecto, calculadas por el propio modelo, con el logotipo,
// la greca y la paleta del sitio en cada hoja. Uso: node scripts/documentos.mjs excel
import fs from 'node:fs';
import path from 'node:path';
import ExcelJS from 'exceljs';
import { RAIZ } from './kit.mjs';
import * as D from './datos.mjs';

const ROJO = 'FFC8102E', GRANATE = 'FF7A0C1F', HUESO = 'FFFBF6F3', NIEBLA = 'FFF4E2E1', LINEA = 'FFEFD6D4', TINTA = 'FF38070F', GRIS = 'FF4A3A3C', BLANCO = 'FFFFFFFF';
const FUENTE = 'Segoe UI';
const relleno = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
const borde = (argb = LINEA) => { const l = { style: 'thin', color: { argb } }; return { top: l, left: l, bottom: l, right: l }; };
const f = (o = {}) => ({ name: FUENTE, size: 10, color: { argb: TINTA }, ...o });
const { REF, mxn, pct } = D;

export async function generarLibro(salida) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'COATL'; wb.company = 'COATL — Cálculo de Oportunidad y Análisis Territorial Local'; wb.title = 'Libro técnico';
  const logo = wb.addImage({ filename: path.join(RAIZ, 'assets/img/logo-coatl.png'), extension: 'png' });
  const greca = wb.addImage({ filename: path.join(RAIZ, 'assets/img/greca-coatl.png'), extension: 'png' });
  const hojas = [];
  /* Crea una hoja con encabezado de marca, una explicación y una tabla con formato. */
  function hoja(nombre, titulo, explicacion, cab, filas, anchos, o = {}) {
    const ws = wb.addWorksheet(nombre, { properties: { tabColor: { argb: o.color || ROJO } }, views: [{ showGridLines: false, state: 'frozen', ySplit: 8 }], pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 } });
    ws.columns = [{ width: 2.5 }, ...anchos.map((w) => ({ width: w }))];
    const ult = ws.getColumn(anchos.length + 1).letter;
    ws.getRow(1).height = 8; ws.getRow(2).height = 28; ws.getRow(3).height = 17; ws.getRow(4).height = 8; ws.getRow(5).height = 15;
    ws.addImage(logo, { tl: { col: 1.12, row: 1.05 }, ext: { width: 52, height: 52 }, editAs: 'absolute' });
    const c0 = anchos.length > 1 ? 'C' : 'B';
    if (anchos.length > 1) { ws.mergeCells(`C2:${ult}2`); ws.mergeCells(`C3:${ult}3`); }
    Object.assign(ws.getCell(c0 + '2'), { value: (anchos.length > 1 ? '' : '        ') + 'COATL · ' + titulo, font: f({ size: 18, bold: true }), alignment: { vertical: 'middle' } });
    Object.assign(ws.getCell(c0 + '3'), { value: (anchos.length > 1 ? '' : '          ') + `LIBRO TÉCNICO · VERSIÓN ${D.VERSION.id.replace('v', '')} · ${D.FECHA.toUpperCase()}`, font: f({ size: 9, bold: true, color: { argb: GRANATE } }), alignment: { vertical: 'middle' } });
    ws.addImage(greca, { tl: { col: 1, row: 4.1 }, ext: { width: Math.min(1400, Math.max(360, anchos.reduce((s, w) => s + w, 0) * 7.2)), height: 13 }, editAs: 'absolute' });
    ws.mergeCells(`B6:${ult}6`);
    Object.assign(ws.getCell('B6'), { value: explicacion, font: f({ color: { argb: GRIS } }), alignment: { wrapText: true, vertical: 'top' } });
    ws.getRow(6).height = Math.max(30, Math.ceil(explicacion.length / Math.max(40, anchos.reduce((s, w) => s + w, 0) * 1.05)) * 14 + 6);
    ws.getRow(7).height = 6;
    cab.forEach((t, i) => Object.assign(ws.getCell(8, i + 2), { value: t, font: f({ bold: true, color: { argb: BLANCO } }), fill: relleno(i === 0 ? ROJO : GRANATE), alignment: { vertical: 'middle', wrapText: true, horizontal: (o.num || []).includes(i) ? 'right' : 'left', indent: 1 }, border: borde(GRANATE) }));
    ws.getRow(8).height = 26;
    filas.forEach((fila, k) => {
      fila.forEach((v, i) => { const c = ws.getCell(9 + k, i + 2);
        Object.assign(c, { value: v, font: f(i === 0 ? { bold: true } : {}), fill: relleno(k % 2 ? HUESO : BLANCO), border: borde(), alignment: { vertical: 'top', wrapText: true, horizontal: (o.num || []).includes(i) ? 'right' : 'left', indent: (o.num || []).includes(i) ? 0 : 1 } });
        if (typeof v === 'number') c.numFmt = (o.formato || {})[i] || '#,##0.00'; });
    });
    if (filas.length) ws.autoFilter = { from: { row: 8, column: 2 }, to: { row: 8 + filas.length, column: cab.length + 1 } };
    const pie = 10 + filas.length;
    if (!o.sinPie) ws.mergeCells(`B${pie}:${ult}${pie}`);
    if (!o.sinPie) Object.assign(ws.getCell(`B${pie}`), { value: '© 2026 ' + D.AUTORES.join(', ') + ' · Herramienta académica: sus resultados no constituyen asesoría financiera, fiscal ni legal.', font: f({ size: 8, color: { argb: GRIS } }), alignment: { wrapText: true } });
    hojas.push([nombre, titulo, String(filas.length)]);
    return ws;
  }
  const n = (x, d = 4) => Number(Number(x).toFixed(d));

  const portada = hoja('Portada', 'Libro técnico', 'Este libro reúne todas las tablas del proyecto COATL, calculadas por el mismo código que usa el sitio. Cada hoja explica qué contiene. Las cifras marcadas como estimación del equipo no provienen de una fuente oficial. Sitio: ' + D.SITIO,
    ['Hoja', 'Contenido', 'Filas'], [], [26, 70, 10], { color: GRANATE, sinPie: true, num: [2] });

  hoja('Versiones', 'Historial de versiones', 'Todas las versiones del proyecto, de la importación inicial a la actual. La fuente es data/versiones.json; al publicar una versión nueva se agrega ahí y se regenera este libro.',
    ['Versión', 'Fecha', 'Título', 'Qué es', 'Por qué se hizo', 'Cambios', 'Efecto en el modelo', 'Confirmaciones'],
    D.VERSIONES.map((v) => [v.id, v.fecha, v.titulo, v.resumen, v.motivo, v.cambios.map((c) => '• ' + c).join('\n'), v.modelo, v.commits.join(', ')]), [9, 12, 30, 50, 50, 70, 46, 24]);
  hoja('Evolución', 'Evolución del escenario de referencia', 'Resultado del escenario de referencia (cafetería en Los Héroes) en cada versión. El modelo cambió de fondo en las versiones 1 a 3; después sus cifras se mantienen, vigiladas por pruebas automáticas.',
    ['Versión', 'Fecha', 'Qué cambió', 'P a 3 años', 'Utilidad mensual', 'ROI anual', 'Recuperación', 'VPN a 3 años'],
    D.VERSIONES.map((v) => [v.id, v.fecha, v.titulo, v.referencia.P, v.referencia.utilidad, v.referencia.roi, v.referencia.payback, v.referencia.vpn]), [9, 12, 46, 12, 16, 12, 14, 14], { num: [3, 4, 5, 6, 7] });
  hoja('Referencia', 'Escenario de referencia', 'Entradas y resultados del escenario de referencia, calculados al generar el libro. Es la prueba de regresión del proyecto: cualquier cambio debe reproducir estas cifras o documentar por qué cambian.',
    ['Concepto', 'Valor', 'Tipo'], [...REF.entradas.map(([k, v]) => [k, v, 'Entrada']), ...REF.indicadores.map(([k, v]) => [k, v, 'Resultado'])], [58, 46, 14], { num: [1] });
  hoja('Contribuciones', 'Contribuciones al modelo logístico', `La suma logística es z = β₀ + Σ βᵢ, con β₀ = ${D.BETA0.toFixed(4)}. Para el escenario de referencia z = ${REF.modelo.z.toFixed(4)} y P = ${REF.P}. Las contribuciones en cero son variables en su opción neutra.`,
    ['Contribución', 'β'], REF.modelo.contribs.map(([k, b]) => [k, n(b, 2)]), [58, 12], { num: [1], formato: { 1: '+0.00;-0.00;0.00' } });
  hoja('Variables', 'Variables del simulador', `Las ${D.VARIABLES.length} variables del formulario, leídas de la plantilla del sitio. En las de opciones, el número entre paréntesis es lo que cada opción aporta al modelo.`,
    ['Pestaña', 'Variable', 'Identificador', 'Tipo', 'Valores posibles', 'Por defecto'], D.VARIABLES.map((v) => [v.pestana, v.nombre, v.id, v.tipo, v.detalle, v.def]), [13, 40, 18, 12, 90, 30]);
  hoja('Sensibilidad', 'Sensibilidad: una variable a la vez', `Cada fila cambia una sola variable del escenario de referencia (P = ${REF.P}) y vuelve a correr el modelo.`,
    ['Variable', 'Opción', 'β', 'P a 3 años', 'Cambio'], D.SENSIBILIDAD.flatMap((s) => s.filas.map((r) => [s.variable, ...r])), [40, 52, 9, 13, 13], { num: [2, 3, 4] });
  hoja('Sensibilidad numérica', 'Sensibilidad a variables numéricas', 'Las variables numéricas actúan a través de la utilidad y del margen de seguridad, que entra al modelo por tramos: un cambio moderado puede no mover P y uno mayor moverla al cruzar un umbral.',
    ['Variable', 'Cambio', 'P a 3 años', 'Utilidad mensual', 'Punto de equilibrio'], D.SENSIBILIDAD_NUM, [28, 12, 13, 18, 24], { num: [1, 2, 3, 4] });
  hoja('Giros', 'Giros calibrados', 'Los 35 giros calibrados por el equipo. Ticket, costo variable, demanda y coeficiente son estimaciones del equipo, editables en el simulador.',
    ['Giro', 'Clave', 'Ticket promedio', 'Costo variable', 'Demanda (clientes/día)', 'β'], D.GIROS.map((g) => [g.n, g.k, g.ticket, g.cv / 100, g.dem, g.z]), [44, 16, 16, 15, 20, 9], { num: [2, 3, 4, 5], formato: { 2: '"$"#,##0', 3: '0%', 4: '0', 5: '+0.00;-0.00;0.00' } });
  hoja('Zonas', 'Zonas de Coacalco', 'Las seis zonas del modelo. Los límites son las 70 AGEB oficiales del INEGI; la agrupación, la afluencia, la renta y el coeficiente son estimaciones del equipo.',
    ['Zona', 'Clave', 'Índice de afluencia', 'Renta por m² al mes', 'β'], D.ZONAS.map((z) => [z.n, z.k, z.afl, z.rm2, z.z]), [56, 14, 18, 20, 9], { num: [2, 3, 4], formato: { 2: '0.00', 3: '"$"#,##0', 4: '+0.00;-0.00;0.00' } });
  const mz = hoja('Giro × zona', 'Probabilidad por giro y zona', 'Probabilidad de supervivencia a 3 años de cada giro en cada zona. Supuestos: clientes = demanda de referencia × afluencia de la zona; renta = renta de referencia × 50 m²; lo demás, como en el escenario de referencia.',
    ['Giro', ...D.ZONAS.map((z) => z.n.split(' · ')[0])], D.MATRIZ.map((r) => [r.giro, ...r.celdas.map((c) => n(c.P))]), [44, 22, 22, 22, 22, 22, 22], { num: [1, 2, 3, 4, 5, 6], formato: Object.fromEntries([1, 2, 3, 4, 5, 6].map((i) => [i, '0.0%'])) });
  mz.addConditionalFormatting({ ref: `C9:H${8 + D.MATRIZ.length}`, rules: [{ type: 'colorScale', cfvo: [{ type: 'min' }, { type: 'percentile', value: 50 }, { type: 'max' }], color: [{ argb: 'FFF4C7CD' }, { argb: 'FFFFFFFF' }, { argb: 'FFBFE3CF' }] }] });
  hoja('Supervivencia', 'Supervivencia nacional y del escenario', 'S₀(t) es la tabla nacional del INEGI (Demografía de los Negocios 1989–2019). S(t) = S₀(t)^θ, con θ = ln P / ln S₀(3), es la curva del escenario de referencia.',
    ['Año t', 'S₀(t) nacional', 'S(t) del escenario', 'Cierres nacionales en el año'], Array.from({ length: 11 }, (_, t) => [t, D.M.S0[t], n(REF.S[t]), t ? n(1 - D.M.S0[t] / D.M.S0[t - 1]) : 0]), [10, 18, 20, 28], { num: [0, 1, 2, 3], formato: { 0: '0', 1: '0.0000', 2: '0.0000', 3: '0.0%' } });
  const res = REF.mc.res;
  hoja('Monte Carlo', 'Distribución de la utilidad anual', `${D.SIMULACIONES.toLocaleString('es-MX')} años simulados con semilla ${D.SEMILLA}. Percentiles con cuantil tipo 7 (interpolación lineal). Media ${mxn(REF.mc.media)}, desviación estándar ${mxn(REF.mc.sd)}.`,
    ['Percentil', 'Utilidad anual'], [1, 2.5, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 97.5, 99].map((q) => [q / 100, Math.round(D.M.cuantil(res, q / 100))]), [14, 22], { num: [0, 1], formato: { 0: '0.0%', 1: '"$"#,##0' } });
  hoja('Incertidumbre', 'Supuestos de incertidumbre', 'Desviaciones usadas en el Monte Carlo y en el rango plausible de P. Son supuestos del equipo, no estimaciones con datos.',
    ['Fuente de variación', 'Magnitud', 'Cómo entra'], D.INCERTIDUMBRE, [40, 14, 62], { num: [1] });
  hoja('Diagnóstico', 'Diagnóstico de solidez', `Lista de verificación de ${D.PUNTOS.length} puntos en 5 niveles. El índice pondera los niveles (${D.NIVELES.map((x) => Math.round(x.w * 100) + ' %').join(', ')}). No es un modelo estadístico y no modifica la probabilidad.`,
    ['Nivel', 'Tema del nivel', 'Peso', 'Punto', 'Qué significa'], D.PUNTOS.map((x) => [x.n, D.NIVELES[x.n - 1].t, D.NIVELES[x.n - 1].w, x.t, x.q]), [8, 38, 9, 44, 80], { num: [0, 2], formato: { 0: '0', 2: '0%' } });
  hoja('Fiscal', 'Tabla del RESICO', `Tasas mensuales del Régimen Simplificado de Confianza para personas físicas (Ley del ISR, artículo 113-E). Escenario de referencia: ISR estimado ${mxn(REF.fiscal.isrMes)} al mes. Estimación orientativa; no es asesoría fiscal.`,
    ['Ingresos del mes', 'Tasa de ISR'], D.RESICO, [30, 14], { num: [1] });
  hoja('Pruebas', 'Pruebas automáticas', 'Pruebas unitarias del modelo y pruebas de navegador. Cada caso de navegador corre en computadora y en teléfono.',
    ['Tipo', 'Archivo', 'Qué comprueba o casos'], [...D.PRUEBAS_UNITARIAS.map(([a, t]) => ['Unitaria', a, t]), ...D.PRUEBAS_E2E.map(([a, c]) => ['Navegador', a, c + ' casos'])], [14, 30, 110]);
  hoja('Módulos', 'Módulos del sitio', 'Archivos que el build une en un solo HTML, en orden.', ['Archivo', 'Líneas', 'Responsabilidad'], D.MODULOS.map(([a, l, r]) => [a, Number(l), r]), [34, 10, 100], { num: [1], formato: { 1: '0' } });
  hoja('Fuentes', 'Fuentes y referencias', 'Fuentes oficiales y referencias metodológicas.', ['Referencia', 'Enlace'], D.FUENTES, [110, 70]);

  hojas.slice(1).forEach(([nombre, titulo, filas], k) => { const r = 9 + k;
    [nombre, titulo, Number(filas)].forEach((v, i) => Object.assign(portada.getCell(r, i + 2), { value: i === 0 ? { text: v, hyperlink: `#'${v}'!A1` } : v, font: f(i === 0 ? { bold: true, color: { argb: ROJO }, underline: true } : {}), fill: relleno(k % 2 ? HUESO : BLANCO), border: borde(), alignment: { indent: 1, horizontal: i === 2 ? 'right' : 'left' } })); });
  const rp = 10 + hojas.length;
  portada.mergeCells(`B${rp}:D${rp}`);
  Object.assign(portada.getCell(`B${rp}`), { value: 'Autores: ' + D.AUTORES.join(', ') + ' · Docente: ' + D.DOCENTE + ' · Proyecto de Participación Especial, Jornada Académica Empresarial, Probabilidad y Estadística.', font: f({ size: 9, color: { argb: GRIS } }), alignment: { wrapText: true } });
  portada.getRow(rp).height = 30;

  fs.mkdirSync(path.dirname(salida), { recursive: true });
  await wb.xlsx.writeFile(salida);
  return `COATL_Libro_Tecnico.xlsx · ${hojas.length} hojas`;
}
