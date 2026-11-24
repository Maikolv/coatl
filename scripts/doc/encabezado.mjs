// Encabezados 1600 × 400 para formularios de Google con la identidad de COATL (Edge + tipografías del sitio).
// Lo usan scripts/encuesta.mjs y scripts/retroalimentacion.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { LOGO } from './kit.mjs';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..', '..');
const fuentes = (n) => pathToFileURL(path.join(RAIZ, 'assets/fuentes/web', n)).href;
const greca = (color) => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='18' viewBox='0 0 72 18'%3E%3Cpath d='M0 18 V12 H6 V6 H12 V0 H24 V6 H18 V12 H30 V18 Z M36 18 V12 H42 V6 H48 V0 H60 V6 H54 V12 H66 V18 Z' fill='%23${color}'/%3E%3C/svg%3E")`;
const html = ({ kicker, titulo, sub }, grande) => `<!doctype html><meta charset="utf-8"><style>
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
p{color:#FBF6F3;opacity:.9;font-size:30px;margin:14px 0 0;font-weight:500}
</style><div class="g t"></div><div class="fondo"></div><div class="g b"></div>
<div class="c"><div class="logo">${LOGO(grande ? 120 : 132)}</div>
<div><p class="k">${kicker}</p><h1>${grande ? titulo.movil : titulo.escritorio}</h1>${grande || !sub ? '' : `<p>${sub}</p>`}</div></div>`;

/** Escribe encabezado.png (escritorio) y encabezado-movil.png (texto más grande) en `salida`. */
export async function encabezados(salida, textos) {
  const nav = await chromium.launch({ channel: 'msedge' });
  const pag = await nav.newPage({ viewport: { width: 1600, height: 400 } });
  for (const [arch, grande] of [['encabezado.png', false], ['encabezado-movil.png', true]]) {
    const tmp = path.join(salida, '_tmp.html');
    fs.writeFileSync(tmp, html(textos, grande));
    await pag.goto(pathToFileURL(tmp).href);
    await pag.evaluate(() => document.fonts.ready);
    await pag.screenshot({ path: path.join(salida, arch) });
    fs.unlinkSync(tmp);
  }
  await nav.close();
}
