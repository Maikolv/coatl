#!/usr/bin/env node
// Descarga fotos de Coacalco de Wikimedia Commons (licencias libres), las recorta a 3:2, las convierte a WebP
// y escribe assets/img/escenarios/creditos.json con autor, licencia y página de cada una.
// Cada foto se usa en UN solo lugar del sitio (ver la columna «uso»). Requiere ffmpeg.
// Uso: node scripts/fotos_sync.mjs
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const UA = { 'User-Agent': 'COATL-proyecto-academico/1.0 (https://github.com/Maikolv/coatl)' };
export const FOTOS = [
  { id: 'mexibus', archivo: 'Coacalco Berriozábal (Mexibús L2) 2.jpg', titulo: 'Mexibús Línea 2, estación Coacalco Berriozábal', uso: 'Carrusel · Territorio' },
  { id: 'power-center', archivo: 'Coacalco Power Center (2024) 1.jpg', titulo: 'Coacalco Power Center sobre la Vía López Portillo', uso: 'Carrusel · Territorio' },
  { id: 'calle-chiapas', archivo: 'Calle Chiapas, San Francisco Coacalco, Mexico 2011 - panoramio.jpg', titulo: 'Calle Chiapas, San Francisco Coacalco', uso: 'Carrusel · Territorio' },
  { id: 'museo-mamut', archivo: 'Museo del Mamut, Coacalco.jpg', titulo: 'Museo del Mamut de Coacalco', uso: 'Carrusel · Territorio' },
  { id: 'cafeteria', archivo: 'Tim Hortons Coacalco.jpg', titulo: 'Cafetería en Coacalco (escenario de referencia: cafetería)', uso: 'Inicio · widget de clientes' },
  { id: 'plaza-coacalco', archivo: 'Plaza Coacalco (2022).jpg', titulo: 'Plaza Coacalco · Corredor Vía López Portillo', uso: 'Carrusel · Inicio' },
  { id: 'zentralia', archivo: 'Zentralia Coacalco 2.jpg', titulo: 'Zentralia Coacalco', uso: 'Carrusel · Territorio' },
  { id: 'plaza-flores', archivo: 'Plaza Las Flores Coacalco 1.jpg', titulo: 'Plaza Las Flores, Villa de las Flores', uso: 'Carrusel · Territorio' },
  { id: 'san-rafael', archivo: 'San Rafael, Coacalco.jpg', titulo: 'Vista aérea de San Rafael · zona Potrero–San Rafael', uso: 'Carrusel · Inicio' },
  { id: 'la-era', archivo: 'La Era Coacalco.jpg', titulo: 'Plaza La Era, Coacalco', uso: 'Carrusel · Territorio' },
  { id: 'valle', archivo: 'Puerta Coacalco)Vista hacia el valle - panoramio.jpg', titulo: 'Vista hacia el valle desde Puerta Coacalco · Sierra de Guadalupe', uso: 'Carrusel · Inicio' },
  { id: 'iglesia-san-francisco', archivo: 'Iglesia San Francisco Coacalco Mexico.JPG', titulo: 'Iglesia de San Francisco · Centro de Coacalco', uso: 'Carrusel · Inicio' },
  { id: 'iglesia-coacalco', archivo: 'Coacalco Iglesia.jpg', titulo: 'Iglesia en Coacalco', uso: 'Carrusel · Inicio' },
  { id: 'sierra', archivo: 'Coacalco de Berriozábal.jpg', titulo: 'Coacalco al pie de la Sierra de Guadalupe', uso: 'Carrusel · Inicio' },
  { id: 'paraje-xolo', archivo: 'Paraje "Xolo" - Coacalco - México - panoramio.jpg', titulo: 'Paraje Xolo · Sierra de Guadalupe', uso: 'Carrusel · Inicio' },
  { id: 'atardecer', archivo: 'Aurora en "Puerta Coacalco" - panoramio.jpg', titulo: 'Atardecer desde Puerta Coacalco', uso: 'Carrusel · Inicio' },
  { id: 'la-btk', archivo: 'La BTK Coacalco.jpg', titulo: 'Comercio de calle: La BTK, Coacalco', uso: 'Carrusel · Inicio' },
  { id: 'etac', archivo: 'ETAC- UNIVERSIDAD CAMPUS COACALCO. - panoramio.jpg', titulo: 'Universidad ETAC, campus Coacalco', uso: 'Carrusel · Inicio' },
];

const api = async (p) => (await fetch('https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ format: 'json', ...p }), { headers: UA })).json();
const limpiar = (h) => String(h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('fotos_sync.mjs')) {
  const dir = 'assets/img/escenarios', tmp = '.herramientas/fotos';
  fs.mkdirSync(dir, { recursive: true }); fs.mkdirSync(tmp, { recursive: true });
  const j = await api({ action: 'query', titles: FOTOS.map((f) => 'File:' + f.archivo).join('|'), prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '1600',
    iiextmetadatafilter: 'LicenseShortName|LicenseUrl|Artist' });
  const info = Object.fromEntries(Object.values(j.query.pages).map((p) => [p.title.replace(/^File:/, ''), p]));
  const creditos = {};
  for (const f of FOTOS) {
    const p = info[f.archivo]; const ii = p?.imageinfo?.[0];
    if (!ii) throw new Error('No se encontró en Commons: ' + f.archivo);
    const m = ii.extmetadata;
    const crudo = `${tmp}/${f.id}.jpg`;
    fs.writeFileSync(crudo, Buffer.from(await (await fetch(ii.thumburl || ii.url, { headers: UA })).arrayBuffer()));
    // recorte central 3:2 a 1200×800 con leve nitidez; WebP calidad 78
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', crudo, '-vf',
      "scale='if(gt(a,1.5),-2,1200)':'if(gt(a,1.5),800,-2)',crop=1200:800,unsharp=5:5:0.4", '-q:v', '78', `${dir}/${f.id}.webp`]);
    creditos[f.id] = { titulo: f.titulo, uso: f.uso, autor: limpiar(m.Artist?.value), licencia: limpiar(m.LicenseShortName?.value),
      licenciaUrl: m.LicenseUrl?.value || '', pagina: p.canonicalurl || ii.descriptionurl, src: `${dir}/${f.id}.webp` };
    console.log(f.id, '·', creditos[f.id].licencia, '·', creditos[f.id].autor);
  }
  fs.writeFileSync(`${dir}/creditos.json`, JSON.stringify(creditos, null, 1));
  const usos = FOTOS.map((f) => f.uso); if (new Set(FOTOS.map((f) => f.archivo)).size !== FOTOS.length) throw new Error('foto repetida');
  console.log(FOTOS.length, 'fotos, sin repetir;', usos.length, 'usos distintos');
}
