// Formulario de retroalimentación de COATL para la Feria Profesiográfica 2026.
// Genera:
//   entregables/retroalimentacion/crear_formulario.gs   Google Apps Script que crea el formulario y su hoja de respuestas
//   entregables/retroalimentacion/encabezado.png         encabezado 1600 × 400 con la identidad de COATL
//   entregables/retroalimentacion/encabezado-movil.png   variante con texto más grande para teléfono
// Sin enlaces web (igual que la encuesta): evita fugas y suplantaciones. El único contacto es el correo del equipo.
// Uso: node scripts/retroalimentacion.mjs
import fs from 'node:fs';
import path from 'node:path';
import { encabezados } from './doc/encabezado.mjs';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const SALIDA = path.join(RAIZ, 'entregables', 'retroalimentacion');
fs.mkdirSync(SALIDA, { recursive: true });

const CONTACTO = 'A660136406@my.uvm.edu.mx';
const AUTORES = 'Miguel Antonio Cruz García, Bruno Alejandro López Bautista y Alonso Arroyo Cortés';
const SEGURIDAD = 'COATL nunca te pedirá contraseñas, datos bancarios ni pagos. Si alguien lo hace en nombre del proyecto, no respondas.';
const APARTADOS = ['Inicio y mapa de Coacalco', 'Territorio', 'DENUE nacional', 'Simulador', 'Para empresas', 'Estrategia', 'Metodología', 'Video', 'Asistente'];

const DESCRIPCION = `Gracias por visitar COATL (Cálculo de Oportunidad y Análisis Territorial Local) en la Feria Profesiográfica 2026. COATL estima la probabilidad de que un negocio siga abierto a 3 años en Coacalco de Berriozábal y cuánto podría ganar, con datos del INEGI y modelos de Probabilidad y Estadística.
Responder toma 2 minutos. Tu opinión nos ayuda a mejorar el proyecto.
Autores: ${AUTORES}. Contacto: ${CONTACTO}.
${SEGURIDAD}`;

const AVISO = `No pedimos datos personales: tu nombre es opcional. Las respuestas solo se usan para mejorar COATL y se reportan en conjunto (conteos y promedios), nunca de forma individual. No se publican, no se suben al repositorio del proyecto ni se envían a servicios de inteligencia artificial. Para pedir que borremos tu respuesta, escribe a ${CONTACTO}.`;

const PREGUNTAS = [
  { t: 'escala', titulo: '¿Qué tan útil te pareció COATL?', min: 'Nada útil', max: 'Muy útil', req: true },
  { t: 'escala', titulo: '¿Qué tan fácil fue usarlo?', min: 'Muy difícil', max: 'Muy fácil', req: true },
  { t: 'escala', titulo: '¿Qué tan claro te quedó cómo se calcula la probabilidad?', min: 'Nada claro', max: 'Muy claro', req: true },
  { t: 'escala', titulo: '¿Qué tan atractivo te pareció el diseño?', min: 'Nada atractivo', max: 'Muy atractivo' },
  { t: 'casillas', titulo: '¿Qué apartados te gustaron más?', ayuda: 'Marca todos los que apliquen.', opciones: APARTADOS },
  { t: 'parrafo', titulo: '¿Qué fue lo que más te gustó?' },
  { t: 'parrafo', titulo: '¿Qué mejorarías o qué le agregarías?' },
  { t: 'opcion', titulo: '¿Recomendarías COATL a alguien que quiere abrir un negocio?', opciones: ['Sí', 'Tal vez', 'No'], req: true },
  { t: 'opcion', titulo: 'Tú eres…', opciones: ['Estudiante de preparatoria', 'Estudiante universitario', 'Docente', 'Madre, padre o familiar', 'Emprendedor o dueño de negocio'], otro: true },
  { t: 'texto', titulo: '¿Qué carrera estudias o te interesa?', ayuda: 'Opcional.' },
  { t: 'texto', titulo: 'Tu nombre', ayuda: 'Opcional.' },
];

const js = (x) => JSON.stringify(x);
function item(q) {
  const base = `.setTitle(${js(q.titulo)})${q.ayuda ? `.setHelpText(${js(q.ayuda)})` : ''}${q.req ? '.setRequired(true)' : ''}`;
  if (q.t === 'escala') return `  f.addScaleItem()${base}.setBounds(1, 5).setLabels(${js(q.min)}, ${js(q.max)});`;
  if (q.t === 'casillas') return `  f.addCheckboxItem()${base}.setChoiceValues(${js(q.opciones)});`;
  if (q.t === 'opcion') return `  f.addMultipleChoiceItem()${base}.setChoiceValues(${js(q.opciones)})${q.otro ? '.showOtherOption(true)' : ''};`;
  if (q.t === 'parrafo') return `  f.addParagraphTextItem()${base};`;
  return `  f.addTextItem()${base};`;
}
const gs = `/**
 * COATL · Retroalimentación (Feria Profesiográfica 2026) — GENERADO por scripts/retroalimentacion.mjs (no editar a mano).
 * Crea el formulario de Google y una hoja de cálculo para las respuestas, en la cuenta de quien lo ejecuta.
 * Cómo usarlo:
 *   1. script.google.com → Proyecto nuevo → pega este archivo → Ejecutar «crearFormulario» → autoriza.
 *   2. Abre el enlace de edición que aparece en el registro → Personalizar tema → Encabezado → sube encabezado.png
 *      (en el mismo tema: color #C8102E, fondo #FBF6F3, fuente «Basic»).
 *   3. Comparte el enlace para responder solo en persona (QR impreso en el stand), nunca en el repositorio.
 */
function crearFormulario() {
  var f = FormApp.create('COATL · ¿Qué te pareció?');
  f.setDescription(${js(DESCRIPCION)});
  f.setProgressBar(false);
  f.setCollectEmail(false);
  f.setAllowResponseEdits(false);
  f.setShowLinkToRespondAgain(true);
  f.setConfirmationMessage(${js(`¡Gracias por tu opinión! El equipo de COATL la leerá para mejorar el proyecto. Si quieres decirnos algo más, escribe a ${CONTACTO}.`)});

  f.addSectionHeaderItem().setTitle('Privacidad').setHelpText(${js(AVISO)});
${PREGUNTAS.map(item).join('\n')}

  var hoja = SpreadsheetApp.create('COATL · Respuestas de retroalimentación');
  f.setDestination(FormApp.DestinationType.SPREADSHEET, hoja.getId());
  Logger.log('Para responder: ' + f.getPublishedUrl());
  Logger.log('Para editar:    ' + f.getEditUrl());
  Logger.log('Respuestas:     ' + hoja.getUrl());
}
`;
fs.writeFileSync(path.join(SALIDA, 'crear_formulario.gs'), gs);
await encabezados(SALIDA, { kicker: 'COATL · Feria Profesiográfica 2026', titulo: { escritorio: '¿Qué te pareció COATL?', movil: '¿Qué te pareció?' }, sub: 'Tu opinión en 2 minutos · Probabilidad y Estadística · UVM' });
// Autocomprobación: el .gs generado es JavaScript válido y trae todas las preguntas.
new Function(gs);
if ((gs.match(/\n  f\.add(Scale|Checkbox|MultipleChoice|ParagraphText|Text)Item\(\)/g) || []).length !== PREGUNTAS.length) throw new Error('faltan preguntas en el .gs');
console.log(`entregables/retroalimentacion: crear_formulario.gs (${PREGUNTAS.length} preguntas), encabezado.png y encabezado-movil.png`);
