// Regenera todos los entregables desde el modelo y el sitio actuales.
// Uso: npm run entregables            (diagrama, plantilla, documento técnico, reporte, presentación y libro de Excel)
//      npm run entregables -- --video (además rehace el video; tarda unos 20 minutos)
//
// Los PDF se componen con el navegador (Chromium o Edge, vía Playwright) con las tipografías, la greca y el logotipo
// del sitio: ya no dependen de que LibreOffice tenga instaladas las fuentes. El índice con números de página necesita
// `uv` (https://docs.astral.sh/uv/); sin él, el índice sale con enlaces pero sin números.
import { spawnSync } from 'node:child_process';

const correr = (cmd, args) => {
  console.log('\n› ' + [cmd, ...args].join(' '));
  const r = spawnSync(cmd, args, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`Falló: ${cmd} ${args.join(' ')}`);
};
const node = (s, ...args) => correr(process.execPath, [s, ...args]);

// 1) Sitio y modelo: los entregables toman sus cifras del motor ya construido.
node('scripts/build.mjs');
// 2) Diagrama, plantilla de Excel y documentos (cada uno lee el modelo y data/versiones.json; nada se escribe a mano).
node('scripts/diagrama_uml.mjs');
node('scripts/plantilla_excel.mjs');
node('scripts/documentos.mjs');
node('scripts/video_presentacion.mjs', '--guion');
if (process.argv.includes('--video')) node('scripts/video_presentacion.mjs');


console.log('\n✔ Entregables actualizados en entregables/');
