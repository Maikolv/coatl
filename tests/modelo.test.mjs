// Pruebas unitarias del núcleo estadístico. Ejecutar: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { cargarModelo, escenarioReferencia } from './cargar.mjs';

const M = cargarModelo();
const cerca = (a, b, tol, msj) => assert.ok(Math.abs(a - b) <= tol, `${msj}: ${a} vs ${b}`);

// Referencia v13: tabulado nacional del INEGI 1989–2019, β₀ = logit(S0(3)) y β de giro y zona estimados con el DENUE.
test('escenario de referencia Cafetería · Los Héroes', () => {
  const e = escenarioReferencia(M);
  const m = M.modeloLogistico(e);
  const S = M.curvaSupervivencia(m.P);
  const mc = M.monteCarlo(e);
  const f = M.finanzas(e, mc, S);
  cerca(m.P, 0.3800, 0.0005, 'P');
  cerca(e.utilMes, 60371, 1, 'utilidad mensual');
  cerca(f.roi, 3.029, 0.0005, 'ROI');
  assert.equal(Math.round(f.payback), 4, 'payback');
  cerca(f.vpn, 686989, 1, 'VPN');
});

test('compatibilidad: con ticket 85 y CV 45 % se recuperan utilidad y payback de la referencia v1', () => {
  const e = escenarioReferencia(M, { ticket: 85, cv: 0.45 });
  const m = M.modeloLogistico(e);
  const f = M.finanzas(e, M.monteCarlo(e), M.curvaSupervivencia(m.P));
  cerca(e.utilMes, 41899, 1, 'utilidad v1');
  assert.equal(Math.round(f.payback), 6);
});

test('Monte Carlo reproducible y con cuantiles ordenados', () => {
  const e = escenarioReferencia(M);
  const a = M.monteCarlo(e), b = M.monteCarlo(e);
  assert.equal(a.media, b.media);
  assert.ok(a.p05 < a.p50 && a.p50 < a.p95);
  assert.equal(a.res.length, M.N_SIM);
});

test('el choque anual común ensancha la dispersión respecto a meses independientes', () => {
  const e = escenarioReferencia(M);
  const conChoque = M.monteCarlo(e).sd;
  const U = M.INCERTIDUMBRE, orig = U.demandaAnual;
  U.demandaAnual = 0;
  const sinChoque = M.monteCarlo(e).sd;
  U.demandaAnual = orig;
  assert.ok(conChoque > 1.5 * sinChoque, `${conChoque} vs ${sinChoque}`);
});

test('rango de P contiene a P y está acotado', () => {
  const m = M.modeloLogistico(escenarioReferencia(M));
  const r = M.rangoP(m);
  assert.ok(r.p05 <= m.P && m.P <= r.p95);
  assert.ok(r.p05 >= 0.04 && r.p95 <= 0.93);
});

test('curva de supervivencia: S(0)=1, S(3)=P y monótona decreciente', () => {
  const S = M.curvaSupervivencia(0.55);
  assert.equal(S[0], 1);
  cerca(S[3], 0.55, 1e-12, 'S(3)');
  for (let t = 1; t < S.length; t++) assert.ok(S[t] <= S[t - 1]);
});

test('mulberry32 reproduce la secuencia conocida', () => {
  const r = M.mulberry32(20262);
  const xs = [r(), r(), r()];
  const r2 = M.mulberry32(20262);
  assert.deepEqual(xs, [r2(), r2(), r2()]);
  xs.forEach((x) => assert.ok(x >= 0 && x < 1));
});

test('cuantil interpola linealmente', () => {
  assert.equal(M.cuantil([0, 10], 0.5), 5);
  assert.equal(M.cuantil([1, 2, 3, 4, 5], 0.95), 4.8);
});

test('el punto de equilibrio sube con el costo variable (CV efectivo acotado a 95 %)', () => {
  const bajo = escenarioReferencia(M, { cv: 0.30 }), alto = escenarioReferencia(M, { cv: 0.97 });
  assert.ok(alto.peDia > bajo.peDia);
  assert.equal(alto.cvEff, 0.95);
});

test('35 giros y 6 zonas', () => {
  assert.equal(Object.keys(M.GIROS).length, 35);
  assert.equal(Object.keys(M.ZONAS).length, 6);
});

test('los controles de modelo de negocio, permisos, modalidad y horario mueven P (neutros por defecto)', () => {
  const base = M.modeloLogistico(escenarioReferencia(M)).P;
  const franquicia = M.modeloLogistico(escenarioReferencia(M, { modZ: 0.18 })).P;
  const sinPermisos = M.modeloLogistico(escenarioReferencia(M, { permZ: -0.25 })).P;
  assert.ok(franquicia > base && sinPermisos < base);
  assert.equal(M.modeloLogistico(escenarioReferencia(M, { modZ: 0, permZ: 0, modalZ: 0, horZ: 0 })).P, base);
});

test('S0 coincide con la tabla oficial del INEGI 1989–2019 (t = 1…10) y β₀ reproduce S0(3)', () => {
  const p = [0.69084109, 0.48118175, 0.42614088, 0.38708876, 0.35679758, 0.33204789, 0.31112232, 0.29299577, 0.27700701, 0.26270459];
  assert.deepEqual(Array.from(M.S0), [1, ...p.map(px => Number(px.toFixed(4)))]);
  cerca(1 / (1 + Math.exp(-M.BETA0)), M.S0[3], 1e-12, 'sigmoide(β₀)');
});

// v9: variables de extorsión y emocionales. Neutras por defecto (no mueven la referencia) y con efecto cuando se usan.
test('cobro de piso y variables emocionales: neutras por defecto, con efecto al usarlas', () => {
  const base = escenarioReferencia(M), P0 = M.modeloLogistico(base).P;
  cerca(M.modeloLogistico(escenarioReferencia(M, { extZ: 0, resilZ: 0, motivZ: 0 })).P, P0, 1e-12, 'neutras');
  assert.ok(M.modeloLogistico(escenarioReferencia(M, { extZ: -0.45 })).P < P0, 'la extorsión baja P');
  assert.ok(M.modeloLogistico(escenarioReferencia(M, { resilZ: -0.15, motivZ: -0.10 })).P < P0, 'desgaste y necesidad bajan P');
  const conPiso = escenarioReferencia(M, { otrosFijos: 6000 + 5000 });   // cuota de 5,000 al mes
  cerca(base.utilMes - conPiso.utilMes, 5000, 1, 'la cuota sale completa de la utilidad');
  assert.ok(conPiso.peDia > base.peDia, 'el punto de equilibrio sube');
});

test('v11 fiscal: tabla del RESICO (art. 113-E LISR), tope de 3.5 millones y régimen general', () => {
  assert.equal(M.tasaResicoPF(25000), 0.010);
  assert.equal(M.tasaResicoPF(25000.01), 0.011);
  assert.equal(M.tasaResicoPF(83333.33), 0.015);
  assert.equal(M.tasaResicoPF(148086), 0.020);
  assert.equal(M.tasaResicoPF(250000), 0.025);
  const f = M.estimarFiscal(148086, 60371, 11000);
  assert.equal(f.regimen, 'resico_pf');
  assert.ok(Math.abs(f.isrMes - 2961.72) < 0.01);
  assert.ok(Math.abs(f.utilDespues - (60371 - 2961.72)) < 0.01);
  assert.ok(Math.abs(f.isn - 330) < 1e-9);
  const g = M.estimarFiscal(400000, 90000, 0);   // 4.8 millones al año: fuera del RESICO de personas físicas
  assert.equal(g.regimen, 'general');
  assert.equal(g.isrMes, 27000);
  assert.equal(M.estimarFiscal(100000, -5000, 0).isrGeneral, 0);   // con pérdida no hay ISR en régimen general
});

test('v11 diagnóstico: 30 puntos en 5 niveles, pesos que suman 1 e índice de 0 a 100', () => {
  assert.equal(M.PUNTOS_MADUREZ.length, 30);
  assert.equal(new Set(M.PUNTOS_MADUREZ.map((p) => p.id)).size, 30);
  assert.equal(Array.from(M.NIVELES_MADUREZ, (n) => M.PUNTOS_MADUREZ.filter((p) => p.n === n.n).length).join(), "7,7,6,5,5");
  assert.ok(Math.abs(M.NIVELES_MADUREZ.reduce((s, n) => s + n.w, 0) - 1) < 1e-9);
  assert.equal(M.indiceMadurez({}).indice, 0);
  assert.equal(M.indiceMadurez({}).nivel, 0);
  const todo = Object.fromEntries(M.PUNTOS_MADUREZ.map((p) => [p.id, 2]));
  assert.equal(M.indiceMadurez(todo).indice, 100);
  assert.equal(M.indiceMadurez(todo).nivel, 5);
  const n1 = Object.fromEntries(M.PUNTOS_MADUREZ.filter((p) => p.n === 1).map((p) => [p.id, 2]));
  assert.equal(M.indiceMadurez(n1).nivel, 1);
  assert.equal(M.indiceMadurez(n1).indice, 35);
});

test('referencia: rango plausible de P = 30.6–46.6 % (vigente desde v13, β del DENUE)', () => {
  const r = M.rangoP(M.modeloLogistico(escenarioReferencia(M)));
  assert.equal((r.p05 * 100).toFixed(1), '30.6');
  assert.equal((r.p95 * 100).toFixed(1), '46.6');
});
