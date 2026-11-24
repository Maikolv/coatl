// Motor de documentos de COATL: un mismo contenido (bloques) se convierte en PDF.
// Los PDF se componen con el motor del navegador (Chromium/Edge vía Playwright) usando EXACTAMENTE los recursos
// del sitio: tipografías de assets/fuentes/, la greca escalonada y el logotipo en SVG. Así los símbolos como β y
// S₀ quedan en su lugar (el navegador resuelve la fuente de respaldo sin desordenar el texto) y no dependen de
// que LibreOffice o Word tengan instaladas las fuentes.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { AUTORES, DOCENTE, VERSION, FECHA, SITIO } from './datos.mjs';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const b64 = (f) => fs.readFileSync(path.join(RAIZ, f)).toString('base64');
export const COL = { rojo: '#C8102E', granate: '#7A0C1F', hueso: '#FBF6F3', tinta: '#38070F', gris: '#6E464B', rosa: '#F7ECE9', niebla: '#E5D3CF' };
export const LOGO = (px = 38) => `<svg width="${px}" height="${px}" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg"><rect width="38" height="38" rx="9" fill="#C8102E"/><path d="M8 27 v-5 h5 v-5 h5 v-5 h12 v5 h-7 v5 h-5 v5 z" fill="#fff"/><circle cx="27.5" cy="14.5" r="1.8" fill="#C8102E"/></svg>`;
export const GRECA_URI = (color = 'C8102E') => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='18' viewBox='0 0 72 18'%3E%3Cpath d='M0 18 V12 H6 V6 H12 V0 H24 V6 H18 V12 H12 V18 Z M36 18 V12 H42 V6 H48 V0 H60 V6 H54 V12 H48 V18 Z' fill='%23${color}'/%3E%3Crect x='28' y='7' width='4' height='4' fill='%23${color}'/%3E%3Crect x='64' y='7' width='4' height='4' fill='%23${color}'/%3E%3C/svg%3E")`;
const GRECA_SVG = (ancho, alto, color = '#C8102E') => `<svg width="${ancho}" height="${alto}" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="g" width="${alto * 4}" height="${alto}" patternUnits="userSpaceOnUse" viewBox="0 0 72 18"><path d="M0 18 V12 H6 V6 H12 V0 H24 V6 H18 V12 H12 V18 Z M36 18 V12 H42 V6 H48 V0 H60 V6 H54 V12 H48 V18 Z" fill="${color}"/><rect x="28" y="7" width="4" height="4" fill="${color}"/><rect x="64" y="7" width="4" height="4" fill="${color}"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`;
export const FUENTES_CSS = `
@font-face{font-family:"Bricolage Grotesque";font-weight:800;src:url(data:font/ttf;base64,${b64('assets/fuentes/BricolageGrotesque-ExtraBold.ttf')}) format("truetype")}
@font-face{font-family:"Hanken Grotesk";font-weight:400;src:url(data:font/ttf;base64,${b64('assets/fuentes/HankenGrotesk-Regular.ttf')}) format("truetype")}
@font-face{font-family:"Hanken Grotesk";font-weight:700;src:url(data:font/ttf;base64,${b64('assets/fuentes/HankenGrotesk-Bold.ttf')}) format("truetype")}
@font-face{font-family:"Spline Sans Mono";font-weight:400;src:url(data:font/ttf;base64,${b64('assets/fuentes/SplineSansMono-Regular.ttf')}) format("truetype")}`;

// ---------- Bloques ----------
export const h1 = (t) => ({ t: 'h1', x: t }), h2 = (t) => ({ t: 'h2', x: t }), h3 = (t) => ({ t: 'h3', x: t });
export const p = (x) => ({ t: 'p', x }), nota = (x) => ({ t: 'nota', x }), formula = (x) => ({ t: 'formula', x });
export const lista = (items) => ({ t: 'ul', items }), pasos = (items) => ({ t: 'ol', items });
export const tabla = (cab, filas, o = {}) => ({ t: 'tabla', cab, filas, ...o });
export const fig = (ruta, pie, o = {}) => ({ t: 'fig', ruta, pie, ...o });
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/* Marcado mínimo dentro del texto: **negrita**, *cursiva*, `código` y [texto](url). */
export const enLinea = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*]+?)\*/g, '$1<em>$2</em>').replace(/`([^`]+?)`/g, '<code>$1</code>').replace(/\[([^\]]+?)\]\((https?:[^)\s]+)\)/g, '<a href="$2">$1</a>');
export const textoPlano = (s) => String(s).replace(/\*\*(.+?)\*\*/g, '$1').replace(/(^|[^*])\*([^*]+?)\*/g, '$1$2').replace(/`([^`]+?)`/g, '$1').replace(/\[([^\]]+?)\]\((https?:[^)\s]+)\)/g, '$1');

// ---------- Imágenes: se reducen con ffmpeg (si existe) para que el PDF no pese de más ----------
const CACHE = path.join(RAIZ, '.herramientas', 'cache-doc');
export function imagenURI(ruta, { ancho = 1400, recorte = 0 } = {}) {
  const abs = path.join(RAIZ, ruta);
  if (!fs.existsSync(abs)) return null;
  fs.mkdirSync(CACHE, { recursive: true });
  const destino = path.join(CACHE, ruta.replace(/[\\/]/g, '_').replace(/\.\w+$/, '') + `_${ancho}_${recorte}.jpg`);
  if (!fs.existsSync(destino) || fs.statSync(destino).mtimeMs < fs.statSync(abs).mtimeMs) {
    const vf = (recorte ? `crop=iw:min(ih\\,iw*${recorte}):0:0,` : '') + `scale=min(${ancho}\\,iw):-2`;
    const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', abs, '-vf', vf, '-q:v', '4', destino]);
    if (r.status !== 0) return 'data:image/' + (abs.endsWith('.png') ? 'png' : 'jpeg') + ';base64,' + fs.readFileSync(abs).toString('base64');
  }
  return 'data:image/jpeg;base64,' + fs.readFileSync(destino).toString('base64');
}

// ---------- HTML del documento ----------
const CSS_DOC = `${FUENTES_CSS}
@page{size:Letter;margin:25mm 18mm 19mm}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;font:400 10.4pt/1.56 "Hanken Grotesk",sans-serif;color:${COL.tinta}}
h1{font:800 22pt/1.12 "Bricolage Grotesque",sans-serif;color:${COL.rojo};break-before:page;margin:0 0 4pt}
h1 .num{display:block;font:400 9pt "Spline Sans Mono",monospace;letter-spacing:.16em;color:${COL.granate};margin-bottom:4pt;text-transform:uppercase}
.greca{height:10pt;background:${GRECA_URI()} repeat-x;background-size:auto 10pt;margin:6pt 0 12pt}
h2{font:800 13.5pt/1.2 "Bricolage Grotesque",sans-serif;color:${COL.granate};margin:15pt 0 5pt;break-after:avoid}
h3{font:700 11pt/1.25 "Hanken Grotesk",sans-serif;color:${COL.tinta};margin:11pt 0 4pt;break-after:avoid}
p{margin:0 0 7pt;text-align:justify;hyphens:auto;orphans:3;widows:3}
ul,ol{margin:0 0 8pt 16pt;padding:0}
li{margin-bottom:3pt;text-align:justify}
strong{font-weight:700}
a{color:${COL.rojo};text-decoration:none}
code{font:400 9pt "Spline Sans Mono",monospace;color:${COL.granate}}
table{width:100%;border-collapse:collapse;font-size:8.7pt;line-height:1.35;margin:6pt 0 3pt}
thead{display:table-header-group}
th{background:${COL.granate};color:#fff;font:800 8.6pt "Bricolage Grotesque",sans-serif;text-align:left;padding:4pt 6pt;vertical-align:bottom}
td{padding:3.4pt 6pt;border-bottom:.5pt solid ${COL.niebla};vertical-align:top}
tbody tr:nth-child(even) td{background:${COL.hueso}}
tr{break-inside:avoid}
td.n,th.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.pie{font:italic 400 8.4pt "Hanken Grotesk",sans-serif;color:${COL.gris};text-align:center;margin:2pt 0 11pt}
.formula{font:400 9.3pt/1.5 "Spline Sans Mono",monospace;background:${COL.rosa};border-left:3pt solid ${COL.rojo};padding:6pt 10pt;margin:6pt 0 9pt;white-space:pre-wrap;break-inside:avoid}
.nota{background:${COL.hueso};border-left:4pt solid ${COL.rojo};padding:7pt 11pt;margin:8pt 0 10pt;break-inside:avoid}
.nota p{margin:0}
figure{margin:9pt 0 3pt;text-align:center;break-inside:avoid}
figure img{max-width:100%;max-height:118mm;border:.5pt solid ${COL.niebla};border-radius:4pt}
.portada{height:232mm;display:flex;flex-direction:column;break-after:page}
.portada .tipo{font:400 9pt "Spline Sans Mono",monospace;letter-spacing:.2em;color:${COL.rojo};text-transform:uppercase;margin-top:26mm}
.portada .marca{display:flex;align-items:center;gap:14pt;margin-top:10pt}
.portada .marca b{font:800 76pt/1 "Bricolage Grotesque",sans-serif;color:${COL.rojo}}
.portada .lema{font:800 17pt/1.2 "Bricolage Grotesque",sans-serif;color:${COL.granate};margin-top:6pt}
.portada .titulo{font:800 25pt/1.15 "Bricolage Grotesque",sans-serif;color:${COL.tinta};margin-top:16mm}
.portada .bajada{font-size:11.5pt;line-height:1.5;margin-top:6pt;max-width:150mm;text-align:left}
.portada .ficha{margin-top:auto;display:grid;grid-template-columns:1fr 1fr;gap:10pt 22pt;border-top:2pt solid ${COL.rojo};padding-top:10pt}
.portada .ficha span{display:block;font:400 7.6pt "Spline Sans Mono",monospace;letter-spacing:.14em;color:${COL.rojo};text-transform:uppercase}
.portada .ficha div{font-size:10pt;line-height:1.4}
.indice{break-after:page}
.indice h1{break-before:auto}
.indice ol{list-style:none;margin:0;padding:0}
.indice li{display:flex;align-items:baseline;gap:5pt;margin:0;padding:2.2pt 0;text-align:left}
.indice li.n1{font-weight:700;margin-top:5pt;color:${COL.granate}}
.indice li.n2{padding-left:14pt;font-size:9.6pt}
.indice li i{flex:1;border-bottom:.6pt dotted ${COL.gris};transform:translateY(-2.5pt)}
.indice li a{color:inherit}
.indice li b{font:400 9pt "Spline Sans Mono",monospace;color:${COL.tinta}}
.version{border:.6pt solid ${COL.niebla};border-left:4pt solid ${COL.rojo};border-radius:4pt;padding:7pt 11pt;margin:9pt 0;break-inside:avoid}
.version h3{margin:0 0 3pt;color:${COL.rojo};font:800 12pt "Bricolage Grotesque",sans-serif}
.version .meta{font:400 8pt "Spline Sans Mono",monospace;color:${COL.gris};margin-bottom:4pt}`;

export function htmlDocumento({ tipo, titulo, bajada, bloques, paginas = {} }) {
  let c1 = 0, c2 = 0, c3 = 0, nT = 0, nF = 0;
  const indice = [];
  const cuerpo = bloques.map((b) => {
    if (b.t === 'h1') { c1++; c2 = 0; const id = 's' + c1, txt = textoPlano(b.x); indice.push({ n: 1, id, num: String(c1), txt }); return `<h1 id="${id}"><span class="num">Capítulo ${c1}</span>${enLinea(b.x)}</h1><div class="greca"></div>`; }
    if (b.t === 'h2') { c2++; c3 = 0; const id = `s${c1}-${c2}`, txt = textoPlano(b.x); indice.push({ n: 2, id, num: `${c1}.${c2}`, txt }); return `<h2 id="${id}">${c1}.${c2} ${enLinea(b.x)}</h2>`; }
    if (b.t === 'h3') { c3++; return `<h3>${c1}.${c2}.${c3} ${enLinea(b.x)}</h3>`; }
    if (b.t === 'p') return `<p>${enLinea(b.x)}</p>`;
    if (b.t === 'nota') return `<div class="nota"><p>${enLinea(b.x)}</p></div>`;
    if (b.t === 'formula') return `<div class="formula">${esc(b.x)}</div>`;
    if (b.t === 'ul' || b.t === 'ol') return `<${b.t}>${b.items.map((i) => `<li>${enLinea(i)}</li>`).join('')}</${b.t}>`;
    if (b.t === 'tabla') { nT++; const num = b.num || [];
      return `<table><thead><tr>${b.cab.map((c, i) => `<th${num.includes(i) ? ' class="n"' : ''}${b.anchos ? ` style="width:${b.anchos[i]}%"` : ''}>${enLinea(c)}</th>`).join('')}</tr></thead><tbody>` +
        b.filas.map((f) => `<tr>${f.map((c, i) => `<td${num.includes(i) ? ' class="n"' : ''}>${enLinea(String(c))}</td>`).join('')}</tr>`).join('') + `</tbody></table><p class="pie">Tabla ${nT}. ${enLinea(b.pie || '')}</p>`; }
    if (b.t === 'fig') { const uri = imagenURI(b.ruta, { ancho: b.ancho || 1400, recorte: b.recorte || 0 }); if (!uri) return ''; nF++; return `<figure><img src="${uri}" alt="${esc(textoPlano(b.pie))}"></figure><p class="pie">Figura ${nF}. ${enLinea(b.pie)}</p>`; }
    if (b.t === 'html') return b.x;
    return '';
  }).join('\n');
  const toc = `<section class="indice"><h1>Índice</h1><div class="greca"></div><ol>${indice.map((i) => `<li class="n${i.n}"><a href="#${i.id}">${i.n === 1 ? 'Capítulo ' + i.num + '. ' : i.num + ' '}${esc(i.txt)}</a><i></i><b>${paginas[i.id] || ''}</b></li>`).join('')}</ol></section>`;
  const portada = `<section class="portada"><p class="tipo">${esc(tipo)} · versión ${VERSION.id.replace('v', '')} · ${esc(FECHA)}</p>
    <div class="marca">${LOGO(74)}<b>COATL</b></div><p class="lema">Cálculo de Oportunidad y Análisis Territorial Local</p><div class="greca"></div>
    <p class="titulo">${esc(titulo)}</p><p class="bajada">${enLinea(bajada)}</p>
    <div class="ficha"><div><span>Autores</span>${AUTORES.map(esc).join('<br>')}</div><div><span>Proyecto</span>Feria Profesiográfica 2026<br>Probabilidad y Estadística<br>UVM</div>
    <div><span>Docente</span>${esc(DOCENTE)}</div><div><span>Sitio</span>${esc(SITIO.replace('https://', ''))}</div></div></section>`;
  return { html: `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><title>COATL · ${esc(titulo)}</title><style>${CSS_DOC}</style></head><body>${portada}${toc}${cuerpo}</body></html>`, indice };
}

// ---------- PDF con Chromium/Edge ----------
let navegador = null;
export async function abrirNavegador() {
  if (!navegador) { const { chromium } = await import('@playwright/test'); navegador = await chromium.launch(process.platform === 'win32' ? { channel: 'msedge' } : {}); }
  return navegador;
}
export async function cerrarNavegador() { if (navegador) { await navegador.close(); navegador = null; } }
const plantillaCab = (titulo) => `<div style="width:100%;padding:0 18mm;font:7.5pt Arial,Helvetica,sans-serif;color:#7A0C1F"><div style="display:flex;align-items:center;gap:6px">${LOGO(15)}<b style="font-size:9.5pt;color:#C8102E">COATL</b><span>· ${esc(titulo)}</span><span style="margin-left:auto">versión ${VERSION.id.replace('v', '')} · ${esc(FECHA)}</span></div><div style="margin-top:3px;height:7px">${GRECA_SVG('100%', 7)}</div></div>`;
const plantillaPie = `<div style="width:100%;padding:0 18mm;font:7pt Arial,Helvetica,sans-serif;color:#6E464B;display:flex"><span>${AUTORES.map(esc).join(' · ')}</span><span style="margin-left:auto">página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`;

async function imprimirPDF(html, salida, titulo) {
  const pag = await (await abrirNavegador()).newPage();
  await pag.setContent(html, { waitUntil: 'load' });
  await pag.evaluate(() => document.fonts.ready);
  await pag.pdf({ path: salida, format: 'Letter', printBackground: true, displayHeaderFooter: true, headerTemplate: plantillaCab(titulo), footerTemplate: plantillaPie,
    margin: { top: '25mm', bottom: '19mm', left: '18mm', right: '18mm' }, outline: true, tagged: true });
  await pag.close();
}
/* Página de cada apartado, para el índice: se lee del propio PDF con PyMuPDF si `uv` está disponible. */
function paginasDe(pdf, indice) {
  const lista = path.join(CACHE, 'indice.json'); fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(lista, JSON.stringify(indice.map((i) => ({ id: i.id, texto: (i.n === 1 ? i.txt : i.num + ' ' + i.txt) }))));
  const r = spawnSync('uv', ['run', '--no-project', '--with', 'pymupdf', 'python', path.join(RAIZ, 'scripts', 'doc', 'paginas_pdf.py'), pdf, lista], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONWARNINGS: 'ignore' } });
  try { return JSON.parse(r.stdout.trim().split('\n').pop()); } catch { return null; }
}
export async function generarPDF(doc, salida) {
  let { html, indice } = htmlDocumento(doc);
  await imprimirPDF(html, salida, doc.titulo);
  const paginas = paginasDe(salida, indice);
  if (paginas) { ({ html } = htmlDocumento({ ...doc, paginas })); await imprimirPDF(html, salida, doc.titulo); }
  return { paginas: paginas ? Object.keys(paginas).length : 0, conIndice: !!paginas };
}
