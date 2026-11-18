// Encuesta a negocios de Coacalco para estimar los β que siguen sin datos (experiencia, reserva, marketing y deuda).
// Genera, desde los mismos datos del sitio (35 giros y 6 zonas de src/datos/datos.js):
//   entregables/encuesta/crear_formulario.gs   Google Apps Script que crea el formulario en la cuenta de quien lo ejecuta
//   entregables/encuesta/encabezado.png         encabezado 1600 × 400 con la identidad de COATL (Edge + tipografías del sitio)
//   entregables/encuesta/encabezado-movil.png   variante 1600 × 400 con texto más grande para teléfono
// Las opciones de cada pregunta corresponden a los niveles del simulador: cada respuesta se puede convertir en la
// variable del modelo sin recodificar. Uso: node scripts/encuesta.mjs
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { cargarModelo } from '../tests/cargar.mjs';
import { LOGO } from './doc/kit.mjs';

const M = cargarModelo();
const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const SALIDA = path.join(RAIZ, 'entregables', 'encuesta');
fs.mkdirSync(SALIDA, { recursive: true });

const SITIO = 'https://maikolv.github.io/coatl/';
const AUTORES = 'Miguel Antonio Cruz García, Bruno Alejandro López Bautista y Alonso Arroyo Cortés';
const GIROS = Object.values(M.GIROS).map((g) => g.n).sort((a, b) => a.localeCompare(b, 'es'));
const ZONAS = Object.values(M.ZONAS).map((z) => z.n);

// ---------- Contenido (una sola definición; el .gs se genera de aquí) ----------
const AVISO = `AVISO DE PRIVACIDAD SIMPLIFICADO (Ley Federal de Protección de Datos Personales en Posesión de los Particulares).
Responsables: ${AUTORES}, autores del proyecto académico COATL (materia de Probabilidad y Estadística).
Finalidad única: estimar con datos reales cómo se relacionan la experiencia, la reserva de efectivo, el marketing y la deuda con la supervivencia de los negocios de Coacalco. No hay fines comerciales ni de cobranza.
Qué datos: características de tu negocio. El nombre comercial, la calle y el contacto son OPCIONALES y solo sirven para buscar el negocio en el DENUE del INEGI dentro de un año; no se publican.
Qué se publica: solo resultados agregados (conteos, porcentajes y coeficientes), nunca respuestas individuales. Las respuestas no se suben al repositorio del proyecto ni se envían a servicios de inteligencia artificial.
Tus derechos: puedes pedir el acceso, la corrección o la eliminación de tus respuestas a los autores del proyecto (${SITIO}). Participar es voluntario y puedes dejar preguntas sin contestar salvo las marcadas como obligatorias.`;

const SECCIONES = [
  { titulo: 'Tu negocio', ayuda: 'Datos generales. Con ellos ubicamos tu negocio en el giro y la zona que usa COATL.', preguntas: [
    { t: 'lista', titulo: '¿A qué se dedica tu negocio?', ayuda: 'Elige el giro más parecido. Si no aparece, elige «Otro».', opciones: [...GIROS, 'Otro'], req: true },
    { t: 'lista', titulo: '¿En qué zona de Coacalco está?', ayuda: 'Las mismas seis zonas del mapa de COATL.', opciones: [...ZONAS, 'No sé'], req: true },
    { t: 'anio', titulo: '¿En qué año abrió el negocio?', ayuda: 'Año de cuatro cifras, por ejemplo 2021.', req: true },
    { t: 'opcion', titulo: '¿Cuántas personas trabajan, contándote a ti?', opciones: ['0 a 5', '6 a 10', '11 a 30', '31 o más'], req: true },
    { t: 'opcion', titulo: 'El local es…', opciones: ['Propio', 'Rentado', 'Sin local fijo (puesto, a domicilio o en línea)'], req: true },
  ] },
  { titulo: 'Cuando abriste', ayuda: 'Piensa en el momento de la apertura, no en hoy. Estas son las variables que COATL todavía no puede medir.', preguntas: [
    { t: 'opcion', titulo: 'Antes de abrir, ¿cuánta experiencia tenías en este mismo giro?', ayuda: 'Como dueño, empleado o familiar que ayudaba.', opciones: ['Ninguna', 'Menos de 1 año', '1 a 3 años', '3 a 5 años', 'Más de 5 años'], req: true },
    { t: 'opcion', titulo: '¿Tomaste capacitación formal sobre el giro o sobre administrar un negocio?', opciones: ['Sí', 'No'], req: true },
    { t: 'opcion', titulo: 'Al abrir, ¿cuántos meses de gastos fijos podías pagar sin vender nada?', ayuda: 'Renta, sueldos, servicios y deudas, con tus ahorros o tu reserva.', opciones: ['Menos de 3 meses', '3 a 6 meses', '6 a 12 meses', 'Más de 12 meses', 'No sé'], req: true },
    { t: 'opcion', titulo: '¿Qué parte de la inversión inicial fue con crédito o préstamo?', opciones: ['Nada (0 %)', 'Menos de la tercera parte (1 % a 29 %)', 'Entre la tercera parte y la mitad (30 % a 59 %)', 'La mayor parte (60 % o más)'], req: true },
    { t: 'casillas', titulo: '¿De dónde vino ese crédito?', ayuda: 'Marca todas las que apliquen.', opciones: ['Banco', 'Caja popular o cooperativa', 'Programa de gobierno', 'Familiares o amigos', 'Proveedor', 'Prestamista informal', 'No usé crédito'] },
    { t: 'opcion', titulo: 'En el primer año, ¿cómo promocionaste el negocio?', opciones: ['No lo promocioné', 'Básico: redes sociales sin pagar', 'Activo: redes, publicidad pagada y WhatsApp Business'], req: true },
    { t: 'opcion', titulo: 'En el primer año, ¿cuánto gastabas al mes en publicidad?', opciones: ['Nada', 'Menos de $500', '$500 a $2,000', '$2,000 a $5,000', 'Más de $5,000'] },
    { t: 'opcion', titulo: 'Ante el SAT y el IMSS, el negocio…', opciones: ['Fue formal desde el inicio', 'Se formalizó poco a poco', 'No está registrado'], req: true },
  ] },
  { titulo: 'Hoy', ayuda: 'La situación actual. Si el negocio ya cerró, tus respuestas valen lo mismo: sin los negocios que cerraron, la estimación saldría sesgada.', preguntas: [
    { t: 'opcion', titulo: '¿El negocio sigue abierto?', opciones: ['Sí, sigue abierto', 'Cerró'], req: true },
    { t: 'anioOpc', titulo: 'Si cerró, ¿en qué año?', ayuda: 'Déjalo en blanco si sigue abierto.' },
    { t: 'opcion', titulo: 'Ventas de un mes normal (aproximadas)', opciones: ['Menos de $25,000', '$25,000 a $50,000', '$50,000 a $100,000', '$100,000 a $300,000', 'Más de $300,000', 'Prefiero no responder'] },
    { t: 'opcion', titulo: '¿Has recibido amenazas o cobro de piso?', ayuda: 'Pregunta opcional. Solo se usa en conteos agregados.', opciones: ['Nunca', 'Alguna vez', 'Con frecuencia', 'Prefiero no responder'] },
  ] },
  { titulo: 'Seguimiento (opcional)', ayuda: 'Dentro de un año buscaremos el negocio en el DENUE del INEGI para saber si sigue operando. Estos datos son opcionales y no se publican.', preguntas: [
    { t: 'texto', titulo: 'Nombre comercial del negocio' },
    { t: 'texto', titulo: 'Calle y número (o la referencia más cercana)' },
    { t: 'opcion', titulo: '¿Aceptas que te contactemos dentro de 12 meses para una pregunta breve?', opciones: ['Sí', 'No'] },
    { t: 'texto', titulo: 'Correo electrónico o teléfono para ese contacto', ayuda: 'Solo si respondiste «Sí» arriba.' },
  ] },
];

// Codificación para el análisis: respuesta → nivel del simulador (mismos valores de src/index.html).
const CODIGOS = {
  experiencia: { 'Ninguna': -0.25, 'Menos de 1 año': -0.25, '1 a 3 años': 0, '3 a 5 años': 0.15, 'Más de 5 años': 0.30 },
  reserva: { 'Menos de 3 meses': -0.30, '3 a 6 meses': 0, '6 a 12 meses': 0.20, 'Más de 12 meses': 0.35 },
  marketing: { 'No lo promocioné': -0.08, 'Básico: redes sociales sin pagar': 0.05, 'Activo: redes, publicidad pagada y WhatsApp Business': 0.12 },
  deuda: { 'Nada (0 %)': 0, 'Menos de la tercera parte (1 % a 29 %)': 0.15, 'Entre la tercera parte y la mitad (30 % a 59 %)': 0.45, 'La mayor parte (60 % o más)': 0.70 },
};

// ---------- Google Apps Script ----------
const js = (x) => JSON.stringify(x);
function item(q) {
  const base = `.setTitle(${js(q.titulo)})${q.ayuda ? `.setHelpText(${js(q.ayuda)})` : ''}${q.req ? '.setRequired(true)' : ''}`;
  if (q.t === 'lista') return `  f.addListItem()${base}.setChoiceValues(${js(q.opciones)});`;
  if (q.t === 'opcion') return `  f.addMultipleChoiceItem()${base}.setChoiceValues(${js(q.opciones)});`;
  if (q.t === 'casillas') return `  f.addCheckboxItem()${base}.setChoiceValues(${js(q.opciones)});`;
  if (q.t === 'anio' || q.t === 'anioOpc') return `  f.addTextItem()${base}.setValidation(FormApp.createTextValidation().setHelpText('Escribe un año entre 1950 y ${new Date().getFullYear()}.').requireNumberBetween(1950, ${new Date().getFullYear()}).build());`;
  return `  f.addTextItem()${base};`;
}
const gs = `/**
 * COATL · Encuesta a negocios de Coacalco — GENERADO por scripts/encuesta.mjs (no editar a mano).
 * Crea el formulario de Google y una hoja de cálculo para las respuestas, en la cuenta de quien lo ejecuta.
 * Cómo usarlo: script.google.com → Proyecto nuevo → pega este archivo → Ejecutar «crearFormulario» → autoriza.
 * Al terminar, el registro de ejecución muestra el enlace para responder y el de edición.
 */
function crearFormulario() {
  var f = FormApp.create('COATL · Encuesta a negocios de Coacalco');
  f.setDescription(${js('Esta encuesta, de unos 5 minutos, ayuda a medir con datos reales qué hace que un negocio de Coacalco siga abierto. Es parte de COATL, un proyecto académico de Probabilidad y Estadística: ' + SITIO)});
  f.setProgressBar(true);
  f.setCollectEmail(false);
  f.setAllowResponseEdits(false);
  f.setShowLinkToRespondAgain(false);
  f.setConfirmationMessage(${js('¡Gracias! Tu respuesta ayuda a que COATL mida con datos lo que hoy son supuestos. Puedes simular tu negocio en ' + SITIO)});

  // Aviso de privacidad y consentimiento: si no acepta, el formulario termina aquí.
  f.addSectionHeaderItem().setTitle('Aviso de privacidad').setHelpText(${js(AVISO)});
  var consentimiento = f.addMultipleChoiceItem().setTitle('¿Aceptas participar con base en este aviso?').setRequired(true);
  consentimiento.setChoices([
    consentimiento.createChoice('Sí, acepto', FormApp.PageNavigationType.CONTINUE),
    consentimiento.createChoice('No acepto', FormApp.PageNavigationType.SUBMIT)
  ]);
${SECCIONES.map((s) => `
  f.addPageBreakItem().setTitle(${js(s.titulo)}).setHelpText(${js(s.ayuda)});
${s.preguntas.map(item).join('\n')}`).join('\n')}

  var hoja = SpreadsheetApp.create('COATL · Respuestas de la encuesta');
  f.setDestination(FormApp.DestinationType.SPREADSHEET, hoja.getId());
  Logger.log('Para responder: ' + f.getPublishedUrl());
  Logger.log('Para editar:    ' + f.getEditUrl());
  Logger.log('Respuestas:     ' + hoja.getUrl());
}
`;
fs.writeFileSync(path.join(SALIDA, 'crear_formulario.gs'), gs);
fs.writeFileSync(path.join(SALIDA, 'codificacion.json'), JSON.stringify({ nota: 'Respuesta → valor del simulador (src/index.html). Deuda = porcentaje financiado típico de cada tramo.', ...CODIGOS }, null, 2) + '\n');

// ---------- Encabezado 1600 × 400 con la identidad del sitio ----------
const fuentes = (n) => pathToFileURL(path.join(RAIZ, 'assets/fuentes/web', n)).href;
const greca = (color) => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='18' viewBox='0 0 72 18'%3E%3Cpath d='M0 18 V12 H6 V6 H12 V0 H24 V6 H18 V12 H30 V18 Z M36 18 V12 H42 V6 H48 V0 H60 V6 H54 V12 H66 V18 Z' fill='%23${color}'/%3E%3C/svg%3E")`;
const encabezado = (grande) => `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:B;src:url(${fuentes('bricolage-grotesque-latin-standard-normal.woff2')});font-weight:200 800}
@font-face{font-family:H;src:url(${fuentes('hanken-grotesk-latin-wght-normal.woff2')});font-weight:100 900}
@font-face{font-family:S;src:url(${fuentes('spline-sans-mono-latin-wght-normal.woff2')});font-weight:300 700}
html,body{margin:0;width:1600px;height:400px;overflow:hidden}
body{background:#7A0C1F;position:relative;font-family:H}
.g{position:absolute;left:0;right:0;height:36px;background:${greca('C8102E')};background-size:144px 36px}
.g.t{top:0}.g.b{bottom:0;transform:scaleY(-1)}
.fondo{position:absolute;inset:36px 0;background:radial-gradient(circle at 85% 50%,rgba(200,16,46,.55),transparent 55%)}
.c{position:absolute;left:${grande ? 300 : 96}px;right:${grande ? 300 : 96}px;top:36px;bottom:36px;display:flex;align-items:center;gap:${grande ? 36 : 44}px}
.logo{width:${grande ? 120 : 132}px;height:${grande ? 120 : 132}px;flex:none;border-radius:26px;background:#C8102E;display:grid;place-items:center;box-shadow:0 0 0 6px #FBF6F3;overflow:hidden}
.k{font-family:S;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:#F4C7CF;font-size:${grande ? 26 : 22}px;margin:0 0 10px}
h1{font-family:B;font-weight:800;color:#FBF6F3;font-size:${grande ? 74 : 84}px;line-height:1;margin:0;letter-spacing:-.01em}
p{color:#FBF6F3;opacity:.9;font-size:${grande ? 30 : 30}px;margin:14px 0 0;font-weight:500}
</style><div class="g t"></div><div class="fondo"></div><div class="g b"></div>
<div class="c"><div class="logo">${LOGO(grande ? 120 : 132)}</div>
<div><p class="k">COATL · Encuesta</p><h1>${grande ? 'Negocios de Coacalco' : 'Encuesta a negocios de Coacalco'}</h1>${grande ? '' : '<p>Qué hace que un negocio siga abierto · 5 minutos · Probabilidad y Estadística</p>'}</div></div>`;
const nav = await chromium.launch({ channel: 'msedge' });
const pag = await nav.newPage({ viewport: { width: 1600, height: 400 } });
for (const [arch, grande] of [['encabezado.png', false], ['encabezado-movil.png', true]]) {
  const tmp = path.join(SALIDA, '_tmp.html');
  fs.writeFileSync(tmp, encabezado(grande));
  await pag.goto(pathToFileURL(tmp).href);
  await pag.evaluate(() => document.fonts.ready);
  await pag.screenshot({ path: path.join(SALIDA, arch) });
  fs.unlinkSync(tmp);
}
await nav.close();
const n = SECCIONES.reduce((s, x) => s + x.preguntas.length, 0) + 1;
console.log(`entregables/encuesta: crear_formulario.gs (${SECCIONES.length + 1} secciones, ${n} preguntas), codificacion.json, encabezado.png y encabezado-movil.png`);
