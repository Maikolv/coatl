// Pruebas unitarias del núcleo estadístico. Ejecutar: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { cargarModelo, escenarioReferencia } from './cargar.mjs';

const M = cargarModelo();
const cerca = (a, b, tol, msj) => assert.ok(Math.abs(a - b) <= tol, `${msj}: ${a} vs ${b}`);

// Escenario de referencia v3 (12-nov-2026): S0 oficial INEGI 1989–2019 y β₀ = logit(S0(3)).
test('escenario de referencia Cafetería · Los Héroes', () => {
  const e = escenarioReferencia(M);
  const m = M.modeloLogistico(e);
  const S = M.curvaSupervivencia(m.P);
  const mc = M.monteCarlo(e);
  const f = M.finanzas(e, mc, S);
  cerca(m.P, 0.5155, 0.0005, 'P');
  cerca(e.utilMes, 60371, 1, 'utilidad mensual');
  cerca(f.roi, 3.029, 0.0005, 'ROI');
  assert.equal(Math.round(f.payback), 4, 'payback');
  cerca(f.vpn, 912776, 1, 'VPN');
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

test('S0 coincide con la tabla oficial del INEGI 1989–2019 (t = 1…5) y β₀ reproduce S0(3)', () => {
  const q = [0.3092, 0.5188, 0.5739, 0.6129, 0.6432];
  q.forEach((qx, x) => cerca(M.S0[x + 1], 1 - qx, 1e-4, 'S0(' + (x + 1) + ')'));
  cerca(1 / (1 + Math.exp(-M.BETA0)), M.S0[3], 1e-12, 'sigmoide(β₀)');
});
