// Medición de rendimiento comparable con la del PR #6: Lighthouse 12.2.1, perfil móvil predeterminado,
// Chrome headless con --disable-gpu, servidor local sobre dist/. Corre N veces y reporta la mediana.
// Uso: node scripts/medir_lighthouse.mjs <etiqueta> [corridas=3]
// Requiere Lighthouse 12.2.1 en .cache/lh (npm i lighthouse@12.2.1) y Google Chrome instalado.
// Escribe docs/rendimiento/<etiqueta>.json con cada corrida y la mediana.
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const etiqueta = process.argv[2] || 'medicion', N = Number(process.argv[3] || 3), PUERTO = 8124;
const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const LH = path.join(RAIZ, '.cache/lh/node_modules/lighthouse/cli/index.js');
const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const servidor = spawn(process.execPath, [path.join(RAIZ, 'scripts/servir.mjs'), String(PUERTO), path.join(RAIZ, 'dist')], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));
const corridas = [];
try {
  for (let i = 0; i < N; i++) {
    const salida = path.join(RAIZ, '.cache/lh', `${etiqueta}-${i}.json`);
    execFileSync(process.execPath, [LH, `http://127.0.0.1:${PUERTO}/`, '--quiet', '--only-categories=performance,accessibility',
      '--chrome-flags=--headless=new --disable-gpu', '--output=json', `--output-path=${salida}`], { env: { ...process.env, CHROME_PATH: CHROME }, stdio: 'inherit' });
    const r = JSON.parse(fs.readFileSync(salida, 'utf8')), a = r.audits;
    const boot = (a['bootup-time']?.details?.items || []).slice(0, 3).map((x) => ({ url: x.url.replace(/^https?:\/\/127\.0\.0\.1:\d+/, ''), total_ms: Math.round(x.total), script_ms: Math.round(x.scripting) }));
    const lcpEl = a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet || '';
    corridas.push({ puntuacion: Math.round(r.categories.performance.score * 100), accesibilidad: Math.round(r.categories.accessibility.score * 100),
      lcp_s: +(a['largest-contentful-paint'].numericValue / 1000).toFixed(2), tbt_s: +(a['total-blocking-time'].numericValue / 1000).toFixed(2),
      fcp_s: +(a['first-contentful-paint'].numericValue / 1000).toFixed(2), tareas_largas: a['long-tasks']?.details?.items?.length ?? null,
      hilo_principal_s: +((a['mainthread-work-breakdown']?.numericValue || 0) / 1000).toFixed(2), elemento_lcp: lcpEl.slice(0, 160), scripts: boot });
    console.log(etiqueta, i + 1, JSON.stringify(corridas.at(-1)));
  }
} finally { servidor.kill(); }
const med = (k) => { const v = corridas.map((c) => c[k]).sort((x, y) => x - y); return v[Math.floor(v.length / 2)]; };
const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: RAIZ }).toString().trim();
const res = { etiqueta, commit, fecha: new Date().toISOString(), configuracion: 'Lighthouse 12.2.1 · móvil predeterminado · Chrome headless --disable-gpu · servidor local dist/', corridas: N,
  mediana: { puntuacion: med('puntuacion'), lcp_s: med('lcp_s'), tbt_s: med('tbt_s'), fcp_s: med('fcp_s'), accesibilidad: med('accesibilidad') }, detalle: corridas };
fs.mkdirSync(path.join(RAIZ, 'docs/rendimiento'), { recursive: true });
fs.writeFileSync(path.join(RAIZ, 'docs/rendimiento', etiqueta + '.json'), JSON.stringify(res, null, 1) + '\n');
console.log('MEDIANA', etiqueta, JSON.stringify(res.mediana));
