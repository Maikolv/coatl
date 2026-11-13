#!/usr/bin/env node
// Descarga las AGEB urbanas de Coacalco (INEGI, Marco Geoestadístico vía wscatgeo) y asigna cada
// una a la zona COATL que contiene su centroide (o a la más cercana). Genera data/ageb/coacalco.json.
// Uso: node scripts/ageb_sync.mjs
import fs from 'node:fs';

const URL_AGEB = 'https://gaia.inegi.org.mx/wscatgeo/v2/geo/agebu/15/020';
// Rectángulos de referencia del equipo (lat, lng): solo sirven para asignar cada AGEB a una zona.
const fuenteMapa = fs.readFileSync(new URL('../src/mapa/mapa.js', import.meta.url), 'utf8');
const ZONAS_REF = Function('return ' + /const COORDS_ZONAS=(\{[\s\S]*?\n\});/.exec(fuenteMapa)[1])();  // misma fuente que el mapa

const r = await fetch(URL_AGEB);
if (!r.ok) throw new Error('INEGI respondió ' + r.status);
const gj = await r.json();
if (!Array.isArray(gj.features) || !gj.features.length) throw new Error('Respuesta sin AGEB');

const centroide = (anillo) => { let a = 0, x = 0, y = 0;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [x0, y0] = anillo[j], [x1, y1] = anillo[i], f = x0 * y1 - x1 * y0; a += f; x += (x0 + x1) * f; y += (y0 + y1) * f; }
  return a ? [x / (3 * a), y / (3 * a)] : anillo[0]; };   // [lng, lat]
const dentro = ([lng, lat], rect) => { const la = rect.map((p) => p[0]), ln = rect.map((p) => p[1]);
  return lat >= Math.min(...la) && lat <= Math.max(...la) && lng >= Math.min(...ln) && lng <= Math.max(...ln); };
const centro = (rect) => [rect.reduce((s, p) => s + p[1], 0) / rect.length, rect.reduce((s, p) => s + p[0], 0) / rect.length];
const red = (v) => Math.round(v * 1e5) / 1e5;

const agebs = gj.features.map((f) => {
  const polis = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  const mayor = polis.reduce((m, p) => (p[0].length > m[0].length ? p : m));
  const c = centroide(mayor[0]);
  let zona = Object.keys(ZONAS_REF).find((k) => dentro(c, ZONAS_REF[k]));
  let asignacion = 'contiene';
  if (!zona) { asignacion = 'cercana';
    zona = Object.keys(ZONAS_REF).sort((a, b) => { const d = (k) => { const [x, y] = centro(ZONAS_REF[k]); return (x - c[0]) ** 2 + (y - c[1]) ** 2; }; return d(a) - d(b); })[0]; }
  return { cvegeo: f.properties.cvegeo, ageb: f.properties.cve_ageb, pob: +f.properties.pob_total || 0,
    viv: +f.properties.total_viviendas_habitadas || 0, zona, asignacion,
    // Leaflet usa [lat, lng]
    poligonos: polis.map((p) => p.map((anillo) => anillo.map(([x, y]) => [red(y), red(x)]))) };
});
console.assert(agebs.every((a) => ZONAS_REF[a.zona]), 'toda AGEB queda en una zona');
const resumen = {};
for (const a of agebs) { const z = (resumen[a.zona] ||= { agebs: 0, pob: 0, viv: 0 }); z.agebs++; z.pob += a.pob; z.viv += a.viv; }

fs.mkdirSync('data/ageb', { recursive: true });
fs.writeFileSync('data/ageb/coacalco.json', JSON.stringify({
  fuente: gj.metadatos, url: URL_AGEB, descargado: new Date().toISOString().slice(0, 10),
  nota: 'Límites oficiales de AGEB urbanas. La pertenencia de cada AGEB a una zona COATL es asignación del equipo (centroide dentro de la zona de referencia o la más cercana).',
  resumen, agebs }));
console.log(agebs.length, 'AGEB ·', JSON.stringify(resumen));
