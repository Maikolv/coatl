// Genera entregables/COATL_Reporte.docx con cifras calculadas por el propio modelo.
// Uso: node scripts/reporte_docx.mjs
import fs from 'node:fs';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, ImageRun, ExternalHyperlink, PageBreak, Footer, PageNumber,
  LevelFormat, TableOfContents,
} from 'docx';
import { REF, FUENTES, AUTORES } from './datos_reporte.mjs';

const ROJO = 'C8102E', GRANATE = '7A0C1F', HUESO = 'FBF6F3', TINTA = '38070F', GRIS = '6E464B';
const ANCHO = 9360; // carta con márgenes de 1 pulgada (DXA)
const { e, mc, f, rp, mxn, pct, modelo } = REF;

const p = (texto, o = {}) => new Paragraph({ spacing: { after: 120, line: 300 }, ...o, children: [].concat(texto).map((t) => (typeof t === 'string' ? new TextRun(t) : t)) });
const b = (t) => new TextRun({ text: t, bold: true });
const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, keepNext: true, children: [new TextRun(t)] });
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, keepNext: true, children: [new TextRun(t)] });
const vineta = (t) => new Paragraph({ numbering: { reference: 'vinetas', level: 0 }, spacing: { after: 80 }, children: [].concat(t).map((x) => (typeof x === 'string' ? new TextRun(x) : x)) });
const formula = (t) => new Paragraph({ spacing: { before: 80, after: 160 }, indent: { left: 360 }, border: { left: { style: BorderStyle.SINGLE, size: 18, color: ROJO, space: 8 } }, shading: { type: ShadingType.CLEAR, fill: HUESO, color: 'auto' }, children: [new TextRun({ text: t, font: 'Consolas', size: 20, color: TINTA })] });
const greca = () => new Paragraph({ border: { bottom: { style: BorderStyle.DOUBLE, size: 12, color: ROJO, space: 4 } }, spacing: { after: 200 } });
const fig = (ruta, w, h, pie) => [
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'png', data: fs.readFileSync(ruta), transformation: { width: w, height: h } })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: pie, italics: true, size: 18, color: GRIS })] }),
];
function tabla(encabezados, filas, anchos) {
  const celda = (t, i, cab) => new TableCell({
    width: { size: anchos[i], type: WidthType.DXA },
    shading: cab ? { type: ShadingType.CLEAR, fill: GRANATE, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text: String(t), bold: cab, color: cab ? 'FFFFFF' : TINTA, size: 20 })] })],
  });
  return new Table({
    width: { size: anchos.reduce((a, x) => a + x, 0), type: WidthType.DXA }, columnWidths: anchos,
    rows: [new TableRow({ tableHeader: true, children: encabezados.map((t, i) => celda(t, i, true)) }),
      ...filas.map((r) => new TableRow({ children: r.map((t, i) => celda(t, i, false)) }))],
  });
}
const tamPng = (ruta) => { const b = fs.readFileSync(ruta); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
const escala = (ruta, anchoPx) => { const [w, h] = tamPng(ruta); return [anchoPx, Math.round(h * anchoPx / w)]; };

const portada = [
  new Paragraph({ spacing: { before: 1800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'COATL', bold: true, size: 96, color: ROJO, font: 'Georgia' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: 'Cálculo de Oportunidad y Análisis Territorial Local', size: 32, color: GRANATE })] }),
  greca(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: 'Reporte técnico: probabilidad de supervivencia a 3 años y rentabilidad esperada de abrir un negocio en Coacalco de Berriozábal, Estado de México', size: 26 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600, after: 80 }, children: [new TextRun({ text: 'Proyecto de Participación Especial · Jornada Académica Empresarial', size: 22, color: GRIS })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: 'Materia: Probabilidad y Estadística', size: 22, color: GRIS })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: 'Docente: Mtra. Noemí Daniela Palacios Fermín', size: 22, color: GRIS })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: 'Autores', bold: true, size: 22, color: GRANATE })] }),
  ...AUTORES.map((a) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: a, size: 24 })] })),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600 }, children: [new TextRun({ text: 'Noviembre de 2026 · https://maikolv.github.io/coatl/', size: 20, color: GRIS })] }),
  new Paragraph({ children: [new PageBreak()] }),
];

const cuerpo = [
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'Contenido', bold: true, size: 34, color: ROJO, font: 'Georgia' })] }),
  new TableOfContents('Contenido', { hyperlink: true, headingStyleRange: '1-2' }),
  new Paragraph({ children: [new PageBreak()] }),

  h1('1. Resumen ejecutivo'),
  p(['COATL es una aplicación web que estima, para un negocio concreto en Coacalco de Berriozábal, la ', b('probabilidad de que siga operando y sea rentable al tercer año'), ' y su ', b('rentabilidad esperada'), '. Encadena cinco herramientas del curso: un modelo logístico de puntaje, una curva de supervivencia de riesgos proporcionales sobre la tabla oficial del INEGI, una simulación Monte Carlo de 2,000 años, indicadores financieros (VPN, ROI, payback) y un análisis FODA cuantificado.']),
  p(['Para el escenario de referencia (cafetería en Los Héroes con los valores por defecto), el modelo estima ', b(`P = ${pct(modelo.P)}`), `, con un rango plausible de ${pct(rp.p05)} a ${pct(rp.p95)}. Ese valor supera el ${pct(REF.M.S0[3])} de supervivencia nacional a 3 años. La utilidad mensual esperada es de ${mxn.format(Math.round(e.utilMes))}, la inversión se recupera en ${f.payback.toFixed(1)} meses y el VPN a 3 años es de ${mxn.format(Math.round(f.vpn))}.`]),
  p(['COATL ', b('no promete certeza'), ': cada resultado se acompaña de su incertidumbre y de los supuestos que lo producen. Ningún resultado constituye asesoría financiera.']),

  h1('2. El territorio en cifras'),
  p('Antes de modelar probabilidades hay que conocer la población de estudio. Todas las cifras se verificaron contra su fuente oficial el 12 de noviembre de 2026.'),
  tabla(['Indicador', 'Valor', 'Fuente (año)'], [
    ['Población total', '293,444 (51.9 % mujeres)', 'INEGI, Censo 2020'],
    ['Unidades económicas', '8,517 → 9,710 → 11,018', 'Gob. de Coacalco / IGECEM (2013, 2018, 2020)'],
    ['Valor agregado censal bruto', '$17,179.6 millones', 'Gob. de Coacalco / IGECEM (2020)'],
    ['Población en pobreza', '28.6 % (26.1 % moderada, 2.5 % extrema)', 'CONEVAL (2020)'],
    ['Supervivencia nacional a 3 años', pct(REF.M.S0[3]), 'INEGI, tabla 1989–2019'],
    ['Esperanza de vida al nacer de un negocio', '8.4 años', 'INEGI, tabla 1989–2019'],
  ], [3000, 3200, 3160]),
  p([new TextRun({ text: 'La distribución de unidades económicas por sector que muestra el sitio es una estimación del equipo: las fuentes municipales consultadas no publican ese desglose. Las afluencias y rentas por zona también son estimaciones propias, editables en el simulador.', italics: true, color: GRIS, size: 20 })], { spacing: { before: 120, after: 200 } }),

  new Paragraph({ children: [new PageBreak()] }),
  h1('3. Metodología'),
  ...fig('docs/diagrama-proceso.png', ...escala('docs/diagrama-proceso.png', 600), 'Figura 1. Diagrama de actividad UML del modelo (6 carriles).'),
  h2('3.1 Modelo logístico de puntaje'),
  p('Cada variable del escenario aporta un coeficiente β y la suma z se convierte en probabilidad con la función logística. β₀ se calibra para que un escenario neutro reproduzca la supervivencia nacional a 3 años.'),
  formula('z = β₀ + Σ βᵢ·xᵢ      P = 1 / (1 + e^(−z))      β₀ = ln(0.4261 / 0.5739) ≈ −0.298'),
  p('Como los β son supuestos del equipo, no estimaciones con error estándar, P se reporta con un rango plausible: se perturba cada βᵢ con desviación relativa de 30 % (β₀ con 0.15) en 1,000 sorteos y se toman los percentiles 5 y 95. Es un análisis de sensibilidad, no un intervalo de confianza muestral.'),
  h2('3.2 Supervivencia tipo Cox'),
  formula('h = ln P / ln S₀(3)        S(t) = S₀(t)^h'),
  tabla(['Año t', 'S₀(t) nacional (INEGI)', 'S(t) del escenario'], REF.supervivencia.map(([t, s0, s]) => [String(t), s0.toFixed(3) + (t > 5 ? '*' : ''), s.toFixed(3)]), [2000, 3680, 3680]),
  p([new TextRun({ text: '* Años 6 a 10 interpolados por el equipo (decaimiento geométrico hasta S(32) = 0.105), porque la nota del INEGI solo publica las edades 0–4 y 30–34.', italics: true, size: 18, color: GRIS })], { spacing: { before: 80, after: 200 } }),
  h2('3.3 Simulación Monte Carlo'),
  p('Cada corrida simula un año con un generador pseudoaleatorio de semilla fija (mulberry32) y el método de Box–Muller. Hay cuatro fuentes de variación: un choque anual común de demanda, el ruido mensual de clientes, el ruido del ticket y la variación del costo variable.'),
  formula('F ~ LogN(−σ²/2, 0.15²)   clientes ~ N(μF, (0.22μF)²)   ticket ~ N(t̄, (0.08t̄)²)   cv″ ~ N(cv′, 0.02²)'),
  p(`Resultado: utilidad anual P5 ${mxn.format(Math.round(mc.p05))}, mediana ${mxn.format(Math.round(mc.p50))}, P95 ${mxn.format(Math.round(mc.p95))} y desviación estándar ${mxn.format(Math.round(mc.sd))}. Los cuantiles se calculan con interpolación lineal (tipo 7).`),
  h2('3.4 Punto de equilibrio y finanzas'),
  formula('PE = CF / (t̄·(1 − cv′))      MS = (V − PE$) / V'),
  formula('VPN = −I₀ + Σ S(t)·Uₜ / (1+r)ᵗ      ROI = Ū / I₀      Payback = I₀ / U_mes'),
  p('Todas las cifras financieras son antes de impuestos (ISR/RESICO), sin depreciación ni sueldo del dueño, y el VPN no incluye valor terminal.'),

  new Paragraph({ children: [new PageBreak()] }),
  h1('4. Escenario de referencia: Cafetería · Los Héroes'),
  tabla(['Métrica', 'Valor'], REF.filas, [6000, 3360]),
  p(''),
  ...fig('docs/capturas/simulador-resultados.png', ...escala('docs/capturas/simulador-resultados.png', 560), 'Figura 2. Simulador con el escenario de referencia.'),
  h2('4.1 Qué variables mueven la probabilidad'),
  tabla(['Variable', 'Aporte β a z'], REF.contribuciones.map(([n, v]) => [n, (v > 0 ? '+' : '') + v.toFixed(2)]), [6400, 2960]),
  p(''),
  ...fig('docs/capturas/analisis.png', ...escala('docs/capturas/analisis.png', 600), 'Figura 3. Tornado de β, comparador de escenarios y herramientas de exportación.'),

  h1('5. Supuestos y limitaciones'),
  vineta(['Los ', b('coeficientes β'), ' los asignó el equipo; no provienen de una regresión con microdatos, que el INEGI no publica a nivel de negocio.']),
  vineta(['La ', b('supervivencia base'), ' es la nacional (1989–2019), aplicada a Coacalco sin ajuste municipal; los años 6–10 están interpolados.']),
  vineta(['Las ', b('desviaciones del Monte Carlo'), ' (22 %, 8 %, 15 %, 2 pp) son supuestos del equipo.']),
  vineta(['El ', b('ticket, el costo variable, la demanda por giro, la afluencia y la renta por zona'), ' son estimaciones propias, editables en el simulador.']),
  vineta(['Las ', b('finanzas'), ' son antes de impuestos y sin valor terminal.']),
  p('Mejoras propuestas: estimar los β con datos de panel de la Demografía de los Negocios; usar una distribución de Poisson para giros con poco flujo de clientes; y validar las rentas por zona con un muestreo de campo.'),

  h1('6. Validación y calidad'),
  vineta('El modelo se reimplementó de forma independiente en Python y reproduce bit a bit los resultados de JavaScript.'),
  vineta('12 pruebas unitarias del modelo y 22 pruebas de extremo a extremo (escritorio y móvil) se ejecutan en integración continua antes de cada publicación.'),
  vineta('Una revisión cruzada con Codex encontró 8 hallazgos; todos se verificaron y corrigieron.'),
  vineta('Lighthouse: Accesibilidad 100 y Buenas prácticas 100.'),

  h1('7. Conclusiones'),
  p('COATL convierte conceptos del curso (probabilidad condicional, función logística, tablas de vida, distribución normal, percentiles y valor esperado) en una herramienta de decisión transparente. Su valor está en mostrar qué tan probable es el éxito, de qué depende y cuánta incertidumbre hay, separando el dato oficial, el supuesto del equipo y el resultado del modelo.'),

  h1('Referencias'),
  ...FUENTES.map(([t, url]) => new Paragraph({ spacing: { after: 100 }, children: [new TextRun(t + ' '), new ExternalHyperlink({ link: url, children: [new TextRun({ text: url, style: 'Hyperlink' })] })] })),
  p([new TextRun({ text: '© 2026 ' + AUTORES.join(', ') + '. Obra protegida por la Ley Federal del Derecho de Autor (arts. 11–13). Sin recopilación de datos personales (LFPDPPP).', size: 18, color: GRIS })], { spacing: { before: 400 } }),
];

const doc = new Document({
  creator: AUTORES.join(', '), title: 'COATL · Reporte técnico', description: 'Reporte técnico del simulador COATL',
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: 'Calibri', size: 22, color: TINTA } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 34, bold: true, color: ROJO, font: 'Georgia' }, paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 26, bold: true, color: GRANATE, font: 'Georgia' }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [{ reference: 'vinetas', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'COATL · Reporte técnico · página ', size: 16, color: GRIS }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GRIS })] })] }) },
    children: [...portada, ...cuerpo],
  }],
});
fs.mkdirSync('entregables', { recursive: true });
fs.writeFileSync('entregables/COATL_Reporte.docx', await Packer.toBuffer(doc));
console.log('entregables/COATL_Reporte.docx generado (ancho útil', ANCHO, 'DXA)');
