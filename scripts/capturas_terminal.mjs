#!/usr/bin/env node
// Ejecuta los comandos reales de verificación y escribe su salida, como TEXTO, en la sección
// «Capturas de la terminal» del README (entre <!-- terminal:inicio --> y <!-- terminal:fin -->).
// Sin imágenes: el README solo tiene imágenes en «Capturas del proyecto».
// La salida no se edita; las salidas largas se recortan a su final. Uso: node scripts/capturas_terminal.mjs [--sin-e2e]
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const PY = spawnSync('uv', ['--version']).status === 0 ? 'uv run --no-project python' : 'python';
const COMANDOS = [
  { id: 'build', cmd: 'npm run build', titulo: 'Construcción del sitio' },
  { id: 'unitarias', cmd: 'npm test', titulo: 'Pruebas unitarias del modelo y del intermediario de IA', ultimas: 12 },
  { id: 'validador', cmd: `${PY} scripts/validar_modelo.py`, titulo: 'Validación cruzada del modelo en Python' },
  { id: 'auditoria', cmd: 'npm audit', titulo: 'Auditoría de dependencias' },
  { id: 'e2e', cmd: 'npx playwright test --reporter=line', titulo: 'Pruebas en navegador (computadora, teléfono y accesibilidad)', ultimas: 14, e2e: true },
];
const sinColor = (t) => t.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '').replace(/\r(?!\n)/g, '\n');
const README = 'README.md', INI = '<!-- terminal:inicio -->', FIN = '<!-- terminal:fin -->';
// Si se omiten las e2e, se conserva su bloque anterior.
const previo = (() => { const s = fs.readFileSync(README, 'utf8'); return s.slice(s.indexOf(INI) + INI.length, s.indexOf(FIN)); })();
const bloquePrevio = (id) => (new RegExp(`<!-- t:${id} -->[\\s\\S]*?<!-- /t:${id} -->`).exec(previo) || [''])[0];

const bloques = [];
for (const c of COMANDOS) {
  if (c.e2e && process.argv.includes('--sin-e2e')) { const b = bloquePrevio(c.id); if (b) bloques.push(b); continue; }
  const t0 = Date.now();
  const r = spawnSync(c.cmd, { shell: true, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: { ...process.env, FORCE_COLOR: '0' } });
  const seg = ((Date.now() - t0) / 1000).toFixed(1);
  let lineas = sinColor((r.stdout || '') + (r.stderr || '')).replace(/\n{3,}/g, '\n\n').trimEnd().split('\n')
    .filter((l) => !/NO_COLOR|trace-warnings|DeprecationWarning/.test(l));
  const recorte = c.ultimas && lineas.length > c.ultimas;
  if (recorte) lineas = lineas.slice(-c.ultimas);
  bloques.push(`<!-- t:${c.id} -->\n**${c.titulo}** · \`${c.cmd}\` · código de salida ${r.status} · ${seg} s\n\n\`\`\`text\n` +
    `$ ${c.cmd}\n${recorte ? `… (se muestran las últimas ${c.ultimas} líneas)\n` : ''}${lineas.join('\n').replace(/```/g, "'''")}\n\`\`\`\n<!-- /t:${c.id} -->`);
  console.log(`${c.id}: salida ${r.status} en ${seg} s`);
}
const s = fs.readFileSync(README, 'utf8');
fs.writeFileSync(README, s.slice(0, s.indexOf(INI) + INI.length) + `\n_Generado el ${new Date().toISOString().slice(0, 10)}._\n\n` + bloques.join('\n\n') + '\n' + s.slice(s.indexOf(FIN)));
