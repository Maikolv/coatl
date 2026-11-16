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
  'src/modelo/fiscal.js',
  'src/datos/madurez.js',
  'src/ui/formato.js',
  'src/ui/controles.js',
  'src/ui/resultados.js',
  'src/ui/widgets.js',
  'src/mapa/mapa.js',
  'src/ui/explorar.js',
  'src/ui/denue.js',
  'src/ui/empresas.js',
  'src/ui/giros_scian.js',
  'src/ui/censo.js',
  'src/ui/describir.js',
  'src/ui/paginas.js',
  'src/ui/asistente.js',
  'src/ui/escena25.js',
  'src/ui/negocios.js',
  'src/ui/mejora.js',
  'src/ui/reporte.js',
  'src/ui/app.js',
];

// Fotos de escenarios (scripts/fotos_sync.mjs): figura con su cita exacta de Wikimedia Commons.
// Regla del proyecto: ninguna foto se repite en el sitio; el build falla si un id aparece dos veces.
const usadas = new Set();
function figuraFoto(id, clase) {
  const cred = JSON.parse(fs.readFileSync(path.join(raiz, 'assets/img/escenarios/creditos.json'), 'utf8'))[id];
  if (!cred) throw new Error('Foto sin créditos: ' + id);
  if (usadas.has(id)) throw new Error('Foto repetida en el sitio: ' + id);
  usadas.add(id);
  const e = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  return `<figure class="foto-cita foto-escena ${clase}"><img src="assets/img/escenarios/${id}.webp" width="1200" height="800" loading="lazy" decoding="async" alt="${e(cred.titulo)}">` +
    `<figcaption><span class="foto-titulo">${e(cred.titulo)}</span> <a href="${e(cred.pagina)}" target="_blank" rel="noopener">${e(cred.autor)}</a> · <a href="${e(cred.licenciaUrl)}" target="_blank" rel="noopener">${e(cred.licencia)}</a></figcaption></figure>`;
}

// Carruseles de fotos (Inicio y Territorio): cada uno toma las fotos cuyo uso es «Carrusel · <grupo>».
// Ninguna foto se repite entre carruseles ni en el resto del sitio (lo garantiza figuraFoto).
const GRUPOS = { inicio: ['Inicio', 'Fotos de Coacalco y sus alrededores'], territorio: ['Territorio', 'Fotos de comercio, movilidad y cultura en Coacalco'] };
function carrusel(grupo) {
  const [uso, etiqueta] = GRUPOS[grupo];
  const cred = JSON.parse(fs.readFileSync(path.join(raiz, 'assets/img/escenarios/creditos.json'), 'utf8'));
  const ids = Object.keys(cred).filter((id) => cred[id].uso === 'Carrusel · ' + uso);
  const figuras = ids.map((id) => [cred[id].titulo, figuraFoto(id, 'car-foto')]);
  if (grupo === 'territorio') {   // la foto del Palacio Municipal va incrustada y abre este carrusel
    figuras.unshift(['Palacio Municipal de Coacalco', '<figure class="foto-cita foto-escena car-foto"><img src="data:image/webp;base64,@@FOTO_PALACIO@@" width="960" height="720" loading="lazy" decoding="async" alt="Fachada del Palacio Municipal de Coacalco con arcos y la estatua de Felipe Berriozábal al frente">' +
      '<figcaption><span class="foto-titulo">Palacio Municipal de Coacalco</span> <a href="https://commons.wikimedia.org/wiki/File:Coacalco_Estado_Mexico.JPG" target="_blank" rel="noopener">ProtoplasmaKid</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a></figcaption></figure>']);
  }
  const n = figuras.length;
  const slides = figuras.map(([, fig], i) => `<li class="car-slide" aria-roledescription="diapositiva" aria-label="${i + 1} de ${n}">` +
    fig.replace('loading="lazy"', i < 3 ? 'loading="eager"' : 'loading="lazy"') + '</li>').join('');
  const puntos = figuras.map(([t], i) => `<button type="button" class="car-punto" data-i="${i}" aria-label="Ver foto ${i + 1}: ${t.replace(/"/g, '')}"></button>`).join('');
  return `<section class="carrusel" id="carrusel-${grupo}" aria-roledescription="carrusel" aria-label="${etiqueta}">
      <ul class="car-pista" tabindex="0" aria-live="off">${slides}</ul>
      <div class="car-controles">
        <button type="button" class="car-btn car-ant" aria-label="Foto anterior">‹</button>
        <div class="car-puntos">${puntos}</div>
        <button type="button" class="car-btn car-sig" aria-label="Foto siguiente">›</button>
        <button type="button" class="car-btn car-pausa" aria-pressed="false" aria-label="Pausar el carrusel">❚❚</button>
      </div>
    </section>`;
}

// Intermediario de IA del proyecto (servicios/ia en Vercel): la clave de Gemini vive allá, nunca en el sitio.
// Se puede cambiar con COATL_IA_URL; vacío desactiva la IA y deja solo el motor local.
const IA_URL = process.env.COATL_IA_URL ?? 'https://coatl-ia.vercel.app/api/coatl';

export function construir() {
  usadas.clear();
  const worker = [leer('src/datos/datos.js'), leer('src/modelo/modelo.js'), leer('src/modelo/worker.js')].join('\n');
  const js = MODULOS_JS.filter((m) => fs.existsSync(path.join(raiz, m)))
    .map((m) => `/* ===== ${m} ===== */\n${leer(m)}`).join('\n')
    .replace('/*@@WORKER@@*/ null', () => JSON.stringify(worker).replace(/</g, '\\u003c'));
  const css = leer('src/ui/estilos.css') + '\n' + leer('src/ui/estilos-explorar.css');
  // Atributos style="" del HTML → reglas [data-ei] con !important (misma precedencia),
  // para que la CSP no necesite 'unsafe-inline' en style-src.
  const reglas = [];
  const plantilla = leer('src/index.html').replace(/ style="([^"]*)"/g, (_, decl) => {
    const n = reglas.length;
    reglas.push(`[data-ei="${n}"]{${decl.split(';').filter((d) => d.trim()).map((d) => d.trim() + ' !important').join(';')}}`);
    return ` data-ei="${n}"`;
  });
  const cssFinal = css + '\n/* estilos en línea movidos por el build */\n' + reglas.join('\n') + '\n';
  let html = plantilla
    .replace('/*@@CSS@@*/', () => cssFinal)
    .replace('/*@@JS@@*/', () => js)
    .replace('@@IA_URL@@', () => IA_URL)
    .replace('@@IA_ORIGEN@@', () => (IA_URL ? new URL(IA_URL).origin : ''))
    .replace(/@@FOTO:([a-z-]+):([a-z-]+)@@/g, (_, id, clase) => figuraFoto(id, clase))
    .replace(/@@CARRUSEL:([a-z]+)@@/g, (_, g) => carrusel(g))
    .replace('@@FOTO_PALACIO@@', () => fs.readFileSync(path.join(raiz, 'assets/img/palacio-coacalco.webp')).toString('base64'));
  // CSP sin 'unsafe-inline' para scripts: se autoriza solo el script en línea por su hash
  //.
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
  // Agregados del DENUE (scripts/denue_sync.py): se publican junto al sitio.
  const plantillas = path.join(raiz, 'assets', 'plantillas');   // plantilla de Excel (scripts/plantilla_excel.mjs)
  if (fs.existsSync(plantillas)) fs.cpSync(plantillas, path.join(raiz, 'dist', 'assets', 'plantillas'), { recursive: true });
  for (const sub of ['zonas', 'escenarios']) {   // fotos de zonas y de escenarios (scripts/fotos_sync.mjs)
    const fotos = path.join(raiz, 'assets', 'img', sub);
    if (fs.existsSync(fotos)) fs.cpSync(fotos, path.join(raiz, 'dist', 'assets', 'img', sub), { recursive: true });
  }
  const datos = path.join(raiz, 'data', 'denue');
  if (fs.existsSync(datos)) fs.cpSync(datos, path.join(raiz, 'dist', 'data', 'denue'), { recursive: true });
  // Actividades presentes en Coacalco (municipio 15-020): archivo pequeño para la lista de giros del simulador.
  const edomex = path.join(datos, 'ent', '15.json');
  if (fs.existsSync(edomex)) {
    const mun = JSON.parse(fs.readFileSync(edomex, 'utf8'))['020'];
    fs.writeFileSync(path.join(raiz, 'dist', 'data', 'denue', 'coacalco.json'), JSON.stringify({ total: mun.total, clases: mun.clases }));
  }
  const censo = path.join(raiz, 'data', 'censo');   // Censos Económicos 2019 (scripts/censo_sync.py)
  if (fs.existsSync(censo)) fs.cpSync(censo, path.join(raiz, 'dist', 'data', 'censo'), { recursive: true });
  const ageb = path.join(raiz, 'data', 'ageb');   // AGEB del INEGI (scripts/ageb_sync.mjs)
  if (fs.existsSync(ageb)) fs.cpSync(ageb, path.join(raiz, 'dist', 'data', 'ageb'), { recursive: true });
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
