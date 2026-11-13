// Build de COATL: une src/ en un index.html autocontenido (raíz y dist/).
// Uso: node scripts/build.mjs   ·   Sin dependencias externas.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
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
  'src/ui/explorar.js',
  'src/ui/app.js',
];

export function construir() {
  const worker = [leer('src/datos/datos.js'), leer('src/modelo/modelo.js'), leer('src/modelo/worker.js')].join('\n');
  const js = MODULOS_JS.filter((m) => fs.existsSync(path.join(raiz, m)))
    .map((m) => `/* ===== ${m} ===== */\n${leer(m)}`).join('\n')
    .replace('/*@@WORKER@@*/ null', () => JSON.stringify(worker).replace(/</g, '\\u003c'));
  const css = leer('src/ui/estilos.css') + '\n' + leer('src/ui/estilos-explorar.css');
  // Atributos style="" del HTML → reglas [data-ei] con !important (misma precedencia),
  // para que la CSP no necesite 'unsafe-inline' en style-src (hallazgo de HawkScan).
  const reglas = [];
  const plantilla = leer('src/index.html').replace(/ style="([^"]*)"/g, (_, decl) => {
    const n = reglas.length;
    reglas.push(`[data-ei="${n}"]{${decl.split(';').filter((d) => d.trim()).map((d) => d.trim() + ' !important').join(';')}}`);
    return ` data-ei="${n}"`;
  });
  const cssFinal = css + '\n/* estilos en línea movidos por el build */\n' + reglas.join('\n') + '\n';
  let html = plantilla
    .replace('/*@@CSS@@*/', () => cssFinal)
    .replace('/*@@JS@@*/', () => js);
  // CSP sin 'unsafe-inline' para scripts: se autoriza solo el script en línea por su hash
  // (hallazgo de HawkScan «CSP: script-src unsafe-inline»).
  const inline = html.match(/<script>([\s\S]*?)<\/script>/);
  if (inline) {
    const hash = crypto.createHash('sha256').update(inline[1], 'utf8').digest('base64');
    html = html.replace("script-src 'self' 'unsafe-inline'", `script-src 'self' 'sha256-${hash}'`);
  }
  const estilo = html.match(/<style>([\s\S]*?)<\/style>/);
  if (estilo) {
    const hash = crypto.createHash('sha256').update(estilo[1], 'utf8').digest('base64');
    html = html.replace("style-src 'self' 'unsafe-inline'", `style-src 'self' 'sha256-${hash}'`);
  }
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

// Variante para artifact de claude.ai: su visor bloquea hojas de estilo externas y descargas.
// Uso: node scripts/build.mjs --artifact  →  dist-artifact/index.html
if (process.argv.includes('--artifact')) {
  const base = fs.readFileSync(path.join(raiz, 'dist', 'index.html'), 'utf8');
  const leafletCss = leer('assets/vendor/leaflet-1.9.4.css');
  const html = base
    .replace(/<link rel="stylesheet" href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/leaflet\/1\.9\.4\/leaflet\.css"[^>]*>/, () => `<style>/* Leaflet 1.9.4 (BSD-2) */\n${leafletCss}</style>`)
    .replace(/<meta http-equiv="Content-Security-Policy"[^>]*>\n?/, '')
    .replace('</style>\n</head>', '#exportarPNG{display:none!important}\n</style>\n</head>');
  fs.mkdirSync(path.join(raiz, 'dist-artifact'), { recursive: true });
  fs.writeFileSync(path.join(raiz, 'dist-artifact', 'index.html'), html);
  console.log('dist-artifact/index.html generado');
}
