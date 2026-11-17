// Aplica a src/datos/datos.js los coeficientes β de giro y zona estimados con el DENUE
// (data/denue/supervivencia.json, generado por scripts/denue_supervivencia.py).
// En cada giro y zona deja: z (estimado, 2 decimales), ee (error estándar) y zEq (el supuesto anterior del equipo,
// para trazabilidad). Los giros sin clase SCIAN propia (spa) conservan el supuesto del equipo y se marcan.
// Uso: node scripts/aplicar_betas.mjs
import fs from 'node:fs';

const DATOS = 'src/datos/datos.js';
const sup = JSON.parse(fs.readFileSync('data/denue/supervivencia.json', 'utf8'));
/* Recalibración (v16): la validación fuera de muestra (scripts/validar_denue.py) midió una pendiente de calibración
   menor que 1: las diferencias entre giros y zonas salían exageradas. Se multiplican por esa pendiente. */
const val = JSON.parse(fs.readFileSync('data/denue/validacion.json', 'utf8'));
const PENDIENTE = val.pendiente_calibracion;
if (!(PENDIENTE > 0 && PENDIENTE <= 1.2)) throw new Error('Pendiente de calibración fuera de rango: ' + PENDIENTE);
// Giros que comparten clase SCIAN con otro: heredan su coeficiente (la clase se cuenta una sola vez).
for (const [g, de] of Object.entries(sup.comparte_clase_con || {})) if (!sup.giros[g] && sup.giros[de]) sup.giros[g] = { ...sup.giros[de], hereda: de };
let s = fs.readFileSync(DATOS, 'utf8').replace(/\r\n/g, '\n');
const f2 = (x) => (x >= 0 ? ' ' : '') + x.toFixed(2);
let n = 0;
function aplicar(bloque, fuente) {
  const ini = s.indexOf(`const ${bloque} = {`), fin = s.indexOf('\n};', ini);
  if (ini < 0) throw new Error('No encontré ' + bloque);
  const cuerpo = s.slice(ini, fin).replace(/^(\s*)([a-z]+):(\s*)\{(.*?)\},?$/gm, (linea, sang, k, esp, dentro) => {
    const coma = linea.trimEnd().endsWith(',') ? ',' : '';
    const limpio = dentro.replace(/,\s*ee:\s*-?[\d.]+/, '').replace(/,\s*zEq:\s*-?[\d.]+/, '').replace(/,\s*fz:"[^"]*"/, '');
    const zActual = Number((/z:\s*(-?[\d.]+)/.exec(limpio) || [])[1]);
    const zEq = Number((/zEq:\s*(-?[\d.]+)/.exec(dentro) || [])[1] ?? zActual);
    const est = fuente[k];
    if (!est) return `${sang}${k}:${esp}{${limpio.replace(/z:\s*-?[\d.]+/, 'z:' + f2(zEq))}, zEq:${f2(zEq)}, fz:"equipo"}${coma}`;
    n++;
    return `${sang}${k}:${esp}{${limpio.replace(/z:\s*-?[\d.]+/, 'z:' + f2(est.beta * PENDIENTE))}, ee:${(est.ee * PENDIENTE).toFixed(3)}, zEq:${f2(zEq)}, fz:"denue"}${coma}`;
  });
  s = s.slice(0, ini) + cuerpo + s.slice(fin);
}
aplicar('GIROS', sup.giros);
aplicar('ZONAS', sup.zonas);
const NOTA = '/* β de giro y zona (z): ESTIMADOS con el DENUE (scripts/denue_supervivencia.py → data/denue/supervivencia.json).';
if (!s.includes(NOTA)) s = s.replace('const GIROS = {', `${NOTA}
   Cohorte de ${sup.n.toLocaleString('es-MX')} negocios incorporados al DENUE en la actualización censal de 2019 en el Estado de México
   (${sup.n_coacalco.toLocaleString('es-MX')} en Coacalco), seguidos a la edición de 2024: regresión logística con errores estándar (ee),
   efectos centrados y contraídos por Bayes empírico, multiplicados por la pendiente de calibración fuera de muestra
   (data/denue/validacion.json). Juguería y pastelería heredan el β de cafetería y panadería (comparten clase SCIAN).
   zEq = supuesto anterior del equipo; fz = fuente del coeficiente. */
const GIROS = {`);
fs.writeFileSync(DATOS, s);
console.log(`β aplicados: ${n} (giros y zonas), pendiente de calibración ${PENDIENTE}. Archivo: ${DATOS}`);
