// Regenera todos los entregables desde el modelo y el sitio actuales, y los convierte a PDF con LibreOffice.
// Uso: npm run entregables            (Word, reporte, presentación, diagrama + PDF)
//      npm run entregables -- --video (además rehace el video; tarda 15-20 min)
// LibreOffice: Windows `winget install TheDocumentFoundation.LibreOffice`; Linux `sudo apt install libreoffice`.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const correr = (cmd, args) => {
  console.log('\n› ' + [cmd, ...args].join(' '));
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' && cmd !== process.execPath });
  if (r.status !== 0) throw new Error(`Falló: ${cmd} ${args.join(' ')}`);
};
const node = (s) => correr(process.execPath, [s]);

// 1) Sitio y modelo: los entregables toman sus cifras del motor ya construido.
node('scripts/build.mjs');
// 2) Generadores (cada uno lee el modelo, no tiene cifras escritas a mano).
for (const s of ['scripts/diagrama_uml.mjs', 'scripts/documento_tecnico_docx.mjs', 'scripts/reporte_docx.mjs', 'scripts/presentacion_pptx.mjs']) node(s);
if (process.argv.includes('--video')) node('scripts/video_presentacion.mjs');

// 3) PDF con LibreOffice headless, si está instalado.
const candidatos = [process.env.SOFFICE, 'C:/Program Files/LibreOffice/program/soffice.exe',
  'C:/Program Files (x86)/LibreOffice/program/soffice.exe', '/Applications/LibreOffice.app/Contents/MacOS/soffice'].filter(Boolean);
let soffice = candidatos.find((c) => existsSync(c));
if (!soffice && spawnSync('soffice', ['--version'], { shell: true }).status === 0) soffice = 'soffice';
if (!soffice) {
  console.warn('\n⚠ LibreOffice no está instalado: se generaron DOCX/PPTX pero los PDF quedan sin actualizar.\n  Windows: winget install TheDocumentFoundation.LibreOffice');
  process.exit(0);
}
const archivos = ['COATL_Documento_Tecnico.docx', 'COATL_Reporte.docx', 'COATL_Presentacion.pptx', 'COATL_Pitch_Inversionistas.pptx']
  .map((f) => join('entregables', f)).filter(existsSync);
// Sin intérprete de comandos: la ruta de LibreOffice en Windows lleva espacios («Program Files»).
console.log(`\n› LibreOffice: convirtiendo ${archivos.length} documentos a PDF`);
const conv = spawnSync(soffice, ['--headless', '--convert-to', 'pdf', '--outdir', 'entregables', ...archivos], { stdio: 'inherit', shell: soffice === 'soffice' });
if (conv.status !== 0) throw new Error(`LibreOffice no pudo convertir los documentos (código ${conv.status})`);
console.log('\n✔ Entregables y PDF actualizados en entregables/');
