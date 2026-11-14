#!/usr/bin/env node
// Ejecuta los comandos reales de verificación y guarda su salida como imágenes de terminal
// (docs/capturas/terminal/*.png) para la sección «Capturas de la terminal» del README.
// La salida NO se edita: se muestra tal cual (sin códigos de color). Las e2e largas se recortan a su final.
// Uso: node scripts/capturas_terminal.mjs [--sin-e2e]
import { chromium } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const SALIDA = 'docs/capturas/terminal';
const PY = spawnSync('uv', ['--version']).status === 0 ? 'uv run --no-project python' : 'python';
const COMANDOS = [
  { id: '1-build', cmd: 'npm run build', titulo: 'Construcción del sitio' },
  { id: '2-pruebas-unitarias', cmd: 'npm test', titulo: 'Pruebas unitarias del modelo y del intermediario de IA', ultimas: 40 },
  { id: '3-validador-python', cmd: `${PY} scripts/validar_modelo.py`, titulo: 'Validación cruzada del modelo en Python' },
  { id: '4-auditoria-dependencias', cmd: 'npm audit', titulo: 'Auditoría de dependencias' },
  { id: '5-pruebas-navegador', cmd: 'npx playwright test --reporter=line', titulo: 'Pruebas en navegador (computadora y teléfono, accesibilidad)', ultimas: 30, e2e: true },
];
const sinColor = (t) => t.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '').replace(/\r(?!\n)/g, '\n');
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const mono = 'data:font/ttf;base64,' + fs.readFileSync('assets/fuentes/SplineSansMono-Regular.ttf').toString('base64');

fs.mkdirSync(SALIDA, { recursive: true }); fs.mkdirSync('.herramientas', { recursive: true });
const navegador = await chromium.launch({ channel: process.env.CI ? undefined : 'msedge' });
const resumen = [];
for (const c of COMANDOS) {
  if (c.e2e && process.argv.includes('--sin-e2e')) continue;
  const t0 = Date.now();
  const r = spawnSync(c.cmd, { shell: true, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: { ...process.env, FORCE_COLOR: '0' } });
  const segundos = ((Date.now() - t0) / 1000).toFixed(1);
  let texto = sinColor((r.stdout || '') + (r.stderr || '')).replace(/\n{3,}/g, '\n\n').trimEnd();
  fs.writeFileSync(`.herramientas/terminal-${c.id}.log`, texto);
  let lineas = texto.split('\n');
  const recorte = c.ultimas && lineas.length > c.ultimas;
  if (recorte) lineas = lineas.slice(-c.ultimas);
  const pag = await navegador.newPage({ viewport: { width: 1100, height: 400 }, deviceScaleFactor: 1.5 });
  await pag.setContent(`<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:M;src:url('${mono}')}
body{margin:0;padding:22px;background:#FBF6F3;font-family:M,monospace}
.v{border-radius:12px;overflow:hidden;box-shadow:0 18px 40px -16px rgba(56,7,15,.45);border:1px solid #7A0C1F}
.b{background:#7A0C1F;color:#FBF6F3;padding:9px 14px;font-size:13px;display:flex;gap:8px;align-items:center}
.b i{width:11px;height:11px;border-radius:50%;background:#FBF6F3;opacity:.55;display:inline-block}
.b span{margin-left:8px;letter-spacing:.04em}
pre{margin:0;background:#1A0508;color:#F4E6E8;padding:16px 18px;font:13px/1.5 M,monospace;white-space:pre-wrap;word-break:break-word}
.p{color:#FF8FA0}.n{color:#C9A9AE;font-style:italic}.ok{color:#8FE3B4}.mal{color:#FF8FA0}
</style><div class="v"><div class="b"><i></i><i></i><i></i><span>${esc(c.titulo)} · coatl</span></div><pre><span class="p">coatl&gt;</span> ${esc(c.cmd)}
${recorte ? '<span class="n">… (salida recortada: se muestran las últimas ' + c.ultimas + ' líneas)</span>\n' : ''}${esc(lineas.join('\n'))
    .replace(/^(.*\b(pass(ed)?|✔|ok|OK|found 0 vulnerabilities)\b.*)$/gm, '<span class="ok">$1</span>')
    .replace(/^(.*\b(fail(ed)?|✘|Error)\b.*)$/gm, '<span class="mal">$1</span>')}
<span class="n">(código de salida ${r.status} · ${segundos} s)</span></pre></div>`);
  await pag.evaluate(() => document.fonts.ready);
  await pag.locator('.v').screenshot({ path: `${SALIDA}/${c.id}.png` });
  await pag.close();
  resumen.push(`${c.id}: salida ${r.status} en ${segundos} s`);
  console.log(resumen.at(-1));
}
await navegador.close();
