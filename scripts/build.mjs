// Build de COATL: une src/ en un index.html autocontenido (raíz y dist/).
// Uso: node scripts/build.mjs   ·   Sin dependencias externas.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const leer = (p) => fs.readFileSync(path.join(raiz, p), 'utf8').replace(/\r\n/g, '\n');

// Orden importa: datos → modelo → formato → UI → mapa → orquestación.
export const MODULOS_JS = [
  'src/datos/datos.js',
  'src/modelo/modelo.js',
  'src/modelo/finanzas.js',
  'src/ui/formato.js',
  'src/ui/controles.js',
  'src/ui/resultados.js',
  'src/ui/widgets.js',
  'src/mapa/mapa.js',
  'src/ui/app.js',
];

export function construir() {
  const js = MODULOS_JS.filter((m) => fs.existsSync(path.join(raiz, m)))
    .map((m) => `/* ===== ${m} ===== */\n${leer(m)}`).join('\n');
  const css = leer('src/ui/estilos.css');
  const html = leer('src/index.html')
    .replace('/*@@CSS@@*/', () => css)
    .replace('/*@@JS@@*/', () => js);
  fs.writeFileSync(path.join(raiz, 'index.html'), html);
  fs.mkdirSync(path.join(raiz, 'dist'), { recursive: true });
  fs.writeFileSync(path.join(raiz, 'dist', 'index.html'), html);
  fs.writeFileSync(path.join(raiz, 'dist', '.nojekyll'), '');
  fs.writeFileSync(path.join(raiz, 'dist', 'robots.txt'), 'User-agent: *\nAllow: /\n');
  return html.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`index.html y dist/index.html generados (${construir().toLocaleString('es-MX')} bytes)`);
}
